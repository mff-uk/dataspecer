import React, { useMemo, useState } from "react";
import { WdClassHierarchySurroundingsDescOnly, WdDomainsOrRanges, WdOwnOrInherited } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "../items/wikidata-property-item";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../../detail/common";
import { Box, Button, DialogActions, Divider, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { LanguageStringFallback } from "../../../../helper/LanguageStringComponents";
import { WikidataLoadingError } from "../../helpers/wikidata-loading-error";
import { WikidataLoading } from "../../helpers/wikidata-loading";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useWdGetEndpoints } from "../../hooks/use-wd-get-endpoints";
import { WikidataClassListWithSelection } from "./wikidata-class-list-with-selection";
import { getAncestorsContainingProperty } from "../../helpers/ancestors-containing-property";
import { WikidataPropertySelectionDialogProps } from "./wikidata-property-selection-dialog";

const SCROLLABLE_CLASS_CONTENT_ID = "selection_scrollable_classc_content"

export interface WikidataPropertySelectionDialogContentProps extends WikidataPropertySelectionDialogProps {
    ancestorsContainingProperty: WdClassHierarchySurroundingsDescOnly[];
}

export const WikidaPropertySelectionDialogContent: React.FC<WikidataPropertySelectionDialogProps> = (props) => {
    const {t} = useTranslation("interpretedSurrounding");
    const ancestorsContainingProperty = useMemo(() => {
        return getAncestorsContainingProperty(props.selectedWdClassSurroundings, props.wdProperty, props.wdPropertyType);
    },[props.selectedWdClassSurroundings, props.wdProperty, props.wdPropertyType])

    return (
        <>
            <DialogTitle id="customized-dialog-title" close={props.close}>
                {t("selecting".concat(" ", props.wdPropertyType))}: <b>{<LanguageStringFallback from={props.wdProperty.labels}/>}</b>
            </DialogTitle>
            {   
                props.wdPropertyType === WikidataPropertyType.ASSOCIATIONS || props.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS 
                ?
                <WikidaPropertySelectionDialogContentAssociations {...props} ancestorsContainingProperty={ancestorsContainingProperty}/>
                :
                <WikidaPropertySelectionDialogContentAttributes {...props} ancestorsContainingProperty={ancestorsContainingProperty}/>
            }
        </>
    );
}

const WikidaPropertySelectionDialogContentAttributes: React.FC<WikidataPropertySelectionDialogContentProps> = (props) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [selectedAncestor, setSelectedAncestor] = useState<WdClassHierarchySurroundingsDescOnly | undefined>(undefined);
    
    return (
        <>
            <DialogContent id={SCROLLABLE_CLASS_CONTENT_ID} dividers>
                <Box 
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        ".MuiStepLabel-labelContainer span": {
                            fontSize: "17px"
                        }
                    }}>
                        <Stepper activeStep={0}>
                            <Step key={"ancestors"} completed={selectedAncestor != null}>
                                <StepLabel>{t("select one ancestor")}</StepLabel>
                            </Step>
                        </Stepper>
                </Box>
                <AncestorsHelpBox />
                <WikidataClassListWithSelection 
                    wdClasses={props.ancestorsContainingProperty} 
                    selectedWdClass={selectedAncestor} 
                    setSelectedWdClass={setSelectedAncestor}
                    scrollableClassContentId={SCROLLABLE_CLASS_CONTENT_ID}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{t("close button")}</Button>
                <Button onClick={props.close} disabled={selectedAncestor == null}>{t("confirm button")}</Button>
            </DialogActions>
        </>
    );
}

const WikidaPropertySelectionDialogContentAssociations: React.FC<WikidataPropertySelectionDialogContentProps> = (props) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [activeStep, setActiveStep] = useState(0);
    const [selectedAncestor, setSelectedAncestor] = useState<WdClassHierarchySurroundingsDescOnly | undefined>(undefined);
    const [selectedEndpoint, setSelectedEndpoint] = useState<WdClassHierarchySurroundingsDescOnly | undefined>(undefined);
    
    const domainsOrRanges: WdDomainsOrRanges = props.wdPropertyType === WikidataPropertyType.ASSOCIATIONS ? 'ranges' : 'domains';
    const ownOrInherited: WdOwnOrInherited = props.includeInheritedProperties ? "inherited" : 'own'
    const {wdEndpoints, isError, isLoading} = 
        useWdGetEndpoints(
            props.selectedWdClassSurroundings.startClassId, 
            props.wdProperty.id, 
            domainsOrRanges, 
            ownOrInherited
        );
    
    const querySuccess = !isLoading && !isError;

    return (
        <>
            <DialogContent id={SCROLLABLE_CLASS_CONTENT_ID} dividers>
                <Box 
                    sx={{
                        width: "100%",
                        ".MuiStepLabel-labelContainer span": {
                            fontSize: "17px"
                        }
                    }}>
                    <Stepper activeStep={activeStep}>
                        <Step key={"ancestors"} completed={selectedAncestor != null}>
                            <StepLabel>{t("select one ancestor")}</StepLabel>
                        </Step>
                        <Step key={"endpoint"} completed={selectedAncestor != null && selectedEndpoint != null}>
                            <StepLabel>{t("select one endpoint")}</StepLabel>
                        </Step>
                    </Stepper>
                </Box>
                {isLoading && <WikidataLoading />}
                {isError && <WikidataLoadingError errorMessage={t("no endpoints")} />}
                {   
                    querySuccess && activeStep === 0 && 
                    <>  
                        <AncestorsHelpBox />
                        <WikidataClassListWithSelection 
                            key={"ancestors"} 
                            wdClasses={props.ancestorsContainingProperty} 
                            selectedWdClass={selectedAncestor} 
                            setSelectedWdClass={setSelectedAncestor}
                            scrollableClassContentId={SCROLLABLE_CLASS_CONTENT_ID}    
                        />
                    </>
                }
                {   
                    querySuccess && activeStep === 1 && 
                    <WikidataClassListWithSelection 
                        key={"endpoints"} 
                        wdClasses={wdEndpoints} 
                        selectedWdClass={selectedEndpoint} 
                        setSelectedWdClass={setSelectedEndpoint}
                        scrollableClassContentId={SCROLLABLE_CLASS_CONTENT_ID}    
                    />
                }
            </DialogContent>
            <DialogActions>
                <Stack direction="row">
                    <Button 
                        disabled={activeStep === 0} 
                        onClick={() => { 
                            setActiveStep(previous => previous - 1);
                            setSelectedEndpoint(undefined);
                        }}
                    >
                        {t("selecting back button")}
                    </Button>
                    <Button 
                        disabled={activeStep === 1 || selectedAncestor == null}
                        onClick={() => setActiveStep(previous => previous + 1)}
                    >
                        {t("selecting next button")}
                    </Button>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Button onClick={props.close}>{t("close button")}</Button>
                <Button onClick={props.close} disabled={selectedAncestor == null || selectedEndpoint == null}>{t("confirm button")}</Button>
            </DialogActions>
        </>
    );
}

const AncestorsHelpBox: React.FC = () => {
    const {t} = useTranslation("interpretedSurrounding");
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 3}}>
                    <HelpOutlineIcon color="info" />
                    <Typography sx={{marginLeft: 2}} fontSize="15px">
                        {t("ancestor selection help 1")}
                        <br/>
                        {t("ancestor selection help 2")}
                    </Typography>
            </Box>
        </>

    );
}
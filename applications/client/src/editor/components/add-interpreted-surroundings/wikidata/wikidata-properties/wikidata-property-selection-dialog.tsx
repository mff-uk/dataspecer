import React, { useContext, useMemo, useState } from "react";
import { dialog } from "../../../../dialog";
import { WdClassHierarchyDescOnly, WdClassHierarchySurroundingsDescOnly, WdClassPropertyEndpoints, WdClassSurroundings, WdDomainsOrRanges, WdFilterByInstance, WdOwnOrInherited, WdPropertyDescOnly, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "./wikidata-property-item";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../detail/common";
import { Box, Button, DialogActions, Divider, List, Stack, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { LanguageStringFallback } from "../../../helper/LanguageStringComponents";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../contexts/wikidata-adapter-context";
import { WikidataLoadingError } from "../helpers/wikidata-loading-error";
import { entitySearchTextFilter } from "../helpers/search-text-filter";
import InfiniteScroll from "react-infinite-scroll-component";
import { WikidataClassItem } from "./wikidata-class-item";
import { WikidataLoading } from "../helpers/wikidata-loading";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const CLASSES_PER_PAGE = 50;

export interface WikidataPropertySelectionDialogProps {
    isOpen: boolean;
    close: () => void;

    wdProperty: WdPropertyDescOnly | undefined,
    selectedWdClassSurroundings: WdClassSurroundings | undefined;
    includeInheritedProperties: boolean;
    wdFilterByInstance: WdFilterByInstance | undefined;
    wdPropertyType: WikidataPropertyType | undefined;
}

interface WikidataPropertySelectionDialogContentProps extends WikidataPropertySelectionDialogProps {
    ancestorsContainingProperty: WdClassHierarchySurroundingsDescOnly[];
}

function getAncestorsContainingProperty(selectedWdClassSurroundings: WdClassSurroundings, wdProperty: WdPropertyDescOnly, wdPropertyType: WikidataPropertyType): WdClassHierarchySurroundingsDescOnly[] {
    const resultClasses: WdClassHierarchySurroundingsDescOnly[] = [];
    [selectedWdClassSurroundings.startClassId, ...selectedWdClassSurroundings.parentsIds].forEach((classId) => {
        const cls = selectedWdClassSurroundings.classesMap.get(classId);
        if (cls != null) {
            let contains = false;
            if (wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS) 
                contains = cls.valueOfProperty.includes(wdProperty.id);
            else contains = cls.subjectOfProperty.includes(wdProperty.id);

            if (contains) resultClasses.push(cls);
        }
    })
    return resultClasses;
}

export const WikidataPropertySelectionDialog: React.FC<WikidataPropertySelectionDialogProps> = dialog({fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: '90%' } } }, (props) => {
    if (props.isOpen && props.wdProperty && props.selectedWdClassSurroundings && props.wdPropertyType) {
        return <WikidaPropertySelectionDialogContent {...props} />
    }
    return null
});

const WikidaPropertySelectionDialogContent: React.FC<WikidataPropertySelectionDialogProps> = (props) => {
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
            <DialogContent id="scrollableClassContent" dividers>
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
                <ClassList 
                    wdClasses={props.ancestorsContainingProperty} 
                    selectedWdClass={selectedAncestor} 
                    setSelectedWdClass={setSelectedAncestor}
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
    const wikidataAdapter = useContext(WikidataAdapterContext);
    const [activeStep, setActiveStep] = useState(0);
    const [selectedAncestor, setSelectedAncestor] = useState<WdClassHierarchySurroundingsDescOnly | undefined>(undefined);
    const [selectedEndpoint, setSelectedEndpoint] = useState<WdClassHierarchySurroundingsDescOnly | undefined>(undefined);
    
    const domainsOrRanges: WdDomainsOrRanges = props.wdPropertyType === WikidataPropertyType.ASSOCIATIONS ? 'ranges' : 'domains';
    const ownOrInherited: WdOwnOrInherited = props.includeInheritedProperties ? "inherited" : 'own'
    const endpointsQuery = useQuery(
        ["endpoints", props.selectedWdClassSurroundings.startClassId.toString(), props.wdProperty.iri, domainsOrRanges, ownOrInherited], 
        async () => {
            return await wikidataAdapter.wdAdapter.connector.getClassPropertyEndpoints(
                props.selectedWdClassSurroundings.startClassId, 
                props.wdProperty.id,
                domainsOrRanges,
                ownOrInherited
            );
        }
    );

    const queryFailed = !endpointsQuery.isLoading && (endpointsQuery.isError || isWdErrorResponse(endpointsQuery.data));
    const querySuccess = !endpointsQuery.isLoading && !queryFailed;

    return (
        <>
            <DialogContent id="scrollableClassContent" dividers>
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
                {endpointsQuery.isLoading && <WikidataLoading />}
                {queryFailed && <WikidataLoadingError errorMessage={t("no endpoints")} />}
                {   
                    querySuccess && activeStep === 0 && 
                    <>  
                        <AncestorsHelpBox />
                        <ClassList key={"ancestors"} wdClasses={props.ancestorsContainingProperty} 
                            selectedWdClass={selectedAncestor} 
                            setSelectedWdClass={setSelectedAncestor}/>
                    </>
                }
                {   
                    querySuccess && activeStep === 1 && 
                    <ClassList key={"endpoints"} wdClasses={(endpointsQuery.data as WdClassPropertyEndpoints).classes} 
                        selectedWdClass={selectedEndpoint} 
                        setSelectedWdClass={setSelectedEndpoint}/>
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

interface ClassListProperties {
    wdClasses: WdClassHierarchyDescOnly[];
    selectedWdClass: WdClassHierarchySurroundingsDescOnly | undefined;
    setSelectedWdClass: React.Dispatch<React.SetStateAction<WdClassHierarchySurroundingsDescOnly>>;
}

const ClassList: React.FC<ClassListProperties> = ({wdClasses, selectedWdClass, setSelectedWdClass}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const [listLength, setListLength] = useState(CLASSES_PER_PAGE);
    const [searchText, setSearchText] = useState("");
    
    const classesToDisplay = useMemo(() => {
        return entitySearchTextFilter(searchText, wdClasses);
    },[wdClasses, searchText])
    
    const actualListLength = classesToDisplay.length < listLength ? classesToDisplay.length : listLength;

    return (
        <>
            <Stack direction="row" alignItems="center" spacing={2} marginTop={3}>
                <TextField
                    placeholder={t("type to search")}
                    sx={{ width: "35%"}}
                    onChange={e => {
                        e.stopPropagation();
                        setSearchText(e.target.value);
                    }}
                    variant={"standard"}
                    autoComplete="off"
                    value={searchText}
                />
                <Typography variant="body2" color="textSecondary">{t("number of classes")}: {classesToDisplay.length}</Typography>
            </Stack>
            <List>
                <InfiniteScroll
                    dataLength={actualListLength}
                    next={() => {
                        let newListLength = listLength + CLASSES_PER_PAGE;
                        if (newListLength > classesToDisplay.length) newListLength = classesToDisplay.length;
                        setListLength(newListLength);
                    }}
                    hasMore={actualListLength < classesToDisplay.length}
                    scrollableTarget="scrollableClassContent"
                    loader={<p>Loading...</p>}
                >
                    {classesToDisplay.slice(0, actualListLength).map((wdClass) => {
                        return (
                            <WikidataClassItem
                                key={wdClass.iri}
                                wdClass={wdClass}
                                selectedWdClass={selectedWdClass}
                                setSelectedWdClass={setSelectedWdClass}
                            />
                        );
                    })}
                </InfiniteScroll>
            </List>
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
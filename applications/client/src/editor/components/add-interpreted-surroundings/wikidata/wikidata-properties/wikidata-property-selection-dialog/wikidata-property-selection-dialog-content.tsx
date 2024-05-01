import React, { useContext, useMemo, useState } from "react";
import {
    WdBaseOrInheritOrder,
    WdClassHierarchyDescOnly,
    WdDomainsOrRanges,
    WdEntityId,
    WdEntityIdsList,
    WdFilterByInstance,
    WdPropertyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType, isWdPropertyTypeAttribute } from "../wikidata-property-item";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../../detail/common";
import {
    Box,
    Button,
    DialogActions,
    Divider,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import { LanguageStringFallback } from "../../../../helper/LanguageStringComponents";
import { WikidataLoadingError } from "../../helpers/wikidata-loading-error";
import { WikidataLoading } from "../../helpers/wikidata-loading";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useWdGetEndpoints } from "../../hooks/use-wd-get-endpoints";
import { getAncestorsContainingProperty } from "../../helpers/ancestors-containing-property";
import { WikidataPropertySelectionDialogProps } from "./wikidata-property-selection-dialog";
import { WdPropertySelectionContext } from "../../contexts/wd-property-selection-context";
import { WdPropertySelectionRecord } from "../../property-selection-record";
import { WikidataClassListWithSelection } from "./wikidata-selection-class-list/wikidata-class-list-with-selection";

const SCROLLABLE_CLASS_CONTENT_ID = "selection_scrollable_class_content";

// Must match the translation ids, since the names are used as labels
// Steps need to be string to work with mui stepper api.
const ANCESTORS_SELECTION_STEP = "select one ancestor";
const ENDPOINTS_SELECTION_STEP = "select one endpoint";

interface WikidaPropertySelectionStepperProcessProps extends WikidataPropertySelectionDialogProps {
    stepsNames: string[];
}

interface WikidataPropertySelectionStepProps extends WikidataPropertySelectionDialogProps {
    selectedWdClass: WdClassHierarchyDescOnly | undefined;
    setSelectedWdClass: (wdClass: WdClassHierarchyDescOnly | undefined) => void;
}

export const WikidaPropertySelectionDialogContent: React.FC<
    WikidataPropertySelectionDialogProps
> = (props) => {
    const { t } = useTranslation("interpretedSurrounding");

    // There must be always at least one step.
    const stepsNames = useMemo(() => {
        const names: string[] = [];
        if (props.includeInheritedProperties) names.push(ANCESTORS_SELECTION_STEP);
        if (
            props.wdPropertyType === WikidataPropertyType.ASSOCIATIONS ||
            props.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS
        ) names.push(ENDPOINTS_SELECTION_STEP);
        return names;
    }, [props.includeInheritedProperties, props.wdPropertyType]);

    return (
        <>
            <DialogTitle id='customized-dialog-title' close={props.close}>
                {t("selecting".concat(" ", props.wdPropertyType))}:{" "}
                <b>{<LanguageStringFallback from={props.wdProperty.labels} />}</b>
            </DialogTitle>
            <WikidataPropertySelectionStepperProcess {...props} stepsNames={stepsNames} />
        </>
    );
};

const WikidataPropertySelectionStepperProcess: React.FC<
    WikidaPropertySelectionStepperProcessProps
> = (props) => {
    const { t } = useTranslation("interpretedSurrounding");
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);
    const [activeStep, setActiveStep] = useState(0);
    const [selection, setSelection] = useState<Array<WdClassHierarchyDescOnly | undefined>>(
        Array(props.stepsNames.length).fill(undefined),
    );
    const [selectionExists, setSelectionExists] = useState(false);

    function setSelectionHandle(wdClass: WdClassHierarchyDescOnly | undefined, idx: number): void {
        const newSelection = [...selection];
        newSelection[idx] = wdClass;
        setSelection(newSelection);
    }

    const stepProps = {
        ...props,
        key: props.stepsNames[activeStep],
        selectedWdClass: selection[activeStep],
        setSelectedWdClass: (wdClass: WdClassHierarchyDescOnly) =>
            setSelectionHandle(wdClass, activeStep),
    };

    function confirmHandle(): boolean {
        let subjectWdClass = props.selectedWdClassSurroundings.classesMap.get(props.selectedWdClassSurroundings.startClassId) as WdClassHierarchyDescOnly;
        let objectWdClass: WdClassHierarchyDescOnly | undefined = undefined;
        if (props.includeInheritedProperties) {
            subjectWdClass = selection[0];
        }
        if (!isWdPropertyTypeAttribute(props.wdPropertyType)) {
            objectWdClass = selection[(selection.length - 1)];
        }

        let success = false;
        if (props.editingWdPropertySelectionId === undefined) {
            success = wdPropertySelectionContext.addWdPropertySelectionRecord(
                WdPropertySelectionRecord.createNew(props.wdPropertyType, props.wdProperty, subjectWdClass, objectWdClass)
            );
        } else {
            success = wdPropertySelectionContext.changeWdPropertySelectionRecord(props.editingWdPropertySelectionId, subjectWdClass, objectWdClass);
        }

        if (!success) {
            setSelectionExists(true);
        } else setSelectionExists(false);

        return success;
    }

    return (
        <>
            <DialogContent id={SCROLLABLE_CLASS_CONTENT_ID} dividers>
                <Box
                    sx={{
                        width: "100%",
                        display: props.stepsNames.length === 1 ? "flex" : "",
                        justifyContent: "center",
                        ".MuiStepLabel-labelContainer span": {
                            fontSize: "17px",
                        },
                    }}
                >
                    <Stepper activeStep={activeStep}>
                        {props.stepsNames.map((step, idx) => (
                            <Step
                                key={step}
                                completed={
                                    selection.indexOf(undefined) > idx ||
                                    selection.indexOf(undefined) === -1
                                }
                            >
                                <StepLabel>{t(step)}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                {selectionExists && <SelectionExistsErrorBox />}
                {props.stepsNames[activeStep] === ANCESTORS_SELECTION_STEP ? (
                    <WikidaPropertySelectionAncestorsStep {...stepProps} />
                ) : (
                    <WikidaPropertySelectionEndpointsStep {...stepProps} />
                )}
            </DialogContent>
            <DialogActions>
                {props.stepsNames.length > 1 && (
                    <>
                        <Stack direction='row'>
                            <Button
                                disabled={activeStep < 1}
                                onClick={() => {
                                    setSelectionHandle(undefined, activeStep);
                                    setActiveStep((previous) => previous - 1);
                                }}
                            >
                                {t("selecting back button")}
                            </Button>
                            <Button
                                disabled={
                                    activeStep === selection.length - 1 ||
                                    selection.indexOf(undefined) === activeStep
                                }
                                onClick={() => setActiveStep((previous) => previous + 1)}
                            >
                                {t("selecting next button")}
                            </Button>
                        </Stack>
                        <Divider orientation='vertical' flexItem />
                    </>
                )}
                <Button onClick={props.close}>{t("close button")}</Button>
                <Button 
                    onClick={() => { 
                        if (confirmHandle()) 
                            props.close(); 
                    }} 
                    disabled={selection.indexOf(undefined) !== -1}
                >
                    {t("confirm button")}
                </Button>
            </DialogActions>
        </>
    );
};

const SelectionExistsErrorBox: React.FC = () => {
    const { t } = useTranslation("interpretedSurrounding");
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2, marginBottom: 2 }}>
                <HelpOutlineIcon color='error' />
                <Typography sx={{ marginLeft: 2 }} fontSize='15px' textAlign="justify">
                    {t("ancestor selection exists error")} 
                </Typography>
            </Box>
        </>
    );
};


const WikidaPropertySelectionAncestorsStep: React.FC<WikidataPropertySelectionStepProps> = (
    props,
) => {
    const ancestorsContainingProperty = useMemo(() => {
        return getAncestorsContainingProperty(
            props.selectedWdClassSurroundings,
            props.wdProperty,
            props.wdPropertyType,
        );
    }, [props.selectedWdClassSurroundings, props.wdProperty, props.wdPropertyType]);

    return (
        <>
            <AncestorsHelpBox />
            <WikidataClassListWithSelection
                wdClasses={ancestorsContainingProperty}
                selectedWdClass={props.selectedWdClass}
                setSelectedWdClass={props.setSelectedWdClass}
                scrollableClassContentId={SCROLLABLE_CLASS_CONTENT_ID}
            />
        </>
    );
};

const AncestorsHelpBox: React.FC = () => {
    const { t } = useTranslation("interpretedSurrounding");
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2, marginBottom: 2 }}>
                <HelpOutlineIcon color='info' />
                <Typography sx={{ marginLeft: 2 }} fontSize='15px' textAlign="justify">
                    {t("ancestor selection help 0")} 
                    {t("ancestor selection help 1")} 
                    {t("ancestor selection help 2")}
                    <br />
                    {t("ancestor selection help 3")}
                </Typography>
            </Box>
        </>
    );
};

function getAllowedWdClassesIds(
    wdPropertyId: WdEntityId,
    wdPropertyType: WikidataPropertyType,
    wdFilterByInstance: WdFilterByInstance,
): WdEntityIdsList | undefined | never {
    if (wdPropertyType === WikidataPropertyType.ASSOCIATIONS) {
        return wdFilterByInstance.subjectOfFilterRecordsMap.get(wdPropertyId);
    } else if (wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS) {
        return wdFilterByInstance.valueOfFilterRecordsMap.get(wdPropertyId);
    } else {
        throw new Error("Filtering endpoints is not allowed for attributes.");
    }
}

function filterEndpointsWithFilterByInstance(
    endpoints: WdClassHierarchyDescOnly[],
    wdProperty: WdPropertyDescOnly,
    wdPropertyType: WikidataPropertyType,
    wdFilterByInstance: WdFilterByInstance,
): WdClassHierarchyDescOnly[] | never {
    try {
        const allowedWdClassesIds = getAllowedWdClassesIds(
            wdProperty.id,
            wdPropertyType,
            wdFilterByInstance,
        );
        if (allowedWdClassesIds) {
            return endpoints.filter((wdClass) => allowedWdClassesIds.includes(wdClass.id));
        } else throw new Error("Filter by instance is missing property endpoints.");
    } catch (e) {
        console.log(e);
    }
    return endpoints;
}

const WikidaPropertySelectionEndpointsStep: React.FC<WikidataPropertySelectionStepProps> = (
    props,
) => {
    const { t } = useTranslation("interpretedSurrounding");
    const [disableFilterByInstance, setDisableFilterByInstance] = useState(false);

    const domainsOrRanges: WdDomainsOrRanges =
        props.wdPropertyType === WikidataPropertyType.ASSOCIATIONS ? "ranges" : "domains";
    const ownOrInherited: WdBaseOrInheritOrder = props.includeInheritedProperties
        ? "inherit"
        : "base";
    const { wdEndpoints, isError, isLoading } = useWdGetEndpoints(
        props.selectedWdClassSurroundings.startClassId,
        props.wdProperty.id,
        domainsOrRanges,
        ownOrInherited,
    );

    const querySuccess = useMemo(() => !isLoading && !isError, [isError, isLoading]);

    const endpointsToDisplay = useMemo(() => {
        if (querySuccess) {
            if (props.wdFilterByInstance && querySuccess && !disableFilterByInstance)
                return filterEndpointsWithFilterByInstance(
                    wdEndpoints,
                    props.wdProperty,
                    props.wdPropertyType,
                    props.wdFilterByInstance,
                );
            else return wdEndpoints;
        } else return [];
    }, [
        disableFilterByInstance,
        props.wdFilterByInstance,
        props.wdProperty,
        props.wdPropertyType,
        querySuccess,
        wdEndpoints,
    ]);

    return (
        <>
            {isLoading && <WikidataLoading />}
            {isError && <WikidataLoadingError errorMessage={t("no endpoints")} />}
            {querySuccess && (
                <>
                    {props.wdFilterByInstance && (
                        <FilterByInstaceHelpBox
                            turnedOff={disableFilterByInstance}
                            toggle={setDisableFilterByInstance}
                        />
                    )}
                    <WikidataClassListWithSelection
                        key={"endpoints"}
                        wdClasses={endpointsToDisplay}
                        selectedWdClass={props.selectedWdClass}
                        setSelectedWdClass={props.setSelectedWdClass}
                        scrollableClassContentId={SCROLLABLE_CLASS_CONTENT_ID}
                    />
                </>
            )}
        </>
    );
};

interface FilterByInstaceHelpBoxProps {
    turnedOff: boolean;
    toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterByInstaceHelpBox: React.FC<FilterByInstaceHelpBoxProps> = ({ turnedOff, toggle }) => {
    const { t } = useTranslation("interpretedSurrounding");
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2, marginBottom: 2 }}>
                <HelpOutlineIcon color='info' />
                <Typography sx={{ marginLeft: 2 }} fontSize='15px'>
                    {t("endpoint selection instance help")}
                </Typography>
                <Button
                    onClick={() => toggle((previous) => !previous)}
                    size='small'
                    color={turnedOff ? "primary" : "error"}
                    variant='contained'
                    style={{
                        marginLeft: 5,
                        maxWidth: "100px",
                        maxHeight: "25px",
                        minWidth: "100px",
                        minHeight: "25px",
                    }}
                >
                    {t(turnedOff ? "turn on" : "turn off")}
                </Button>
            </Box>
        </>
    );
};

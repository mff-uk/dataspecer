import {
    WdClassDescOnly,
    WdClassSurroundings,
    WdEntityId,
    WdFilterByInstance,
} from "@dataspecer/wikidata-experimental-adapter";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { WikidataProperties } from "./wikidata-properties/wikidata-properties";
import { WikidataLoadedProperties } from "./wikidata-properties/wikidata-loaded-properties";
import { useContext, useState } from "react";
import { useDialog } from "../../../../dialog";
import { WikidataFilterByInstanceDialog } from "./wikidata-filter-by-instance-dialog/wikidata-filter-by-instance-dialog";
import { WdPropertySelectionContext } from "../contexts/wd-property-selection-context";
import { WikidataManageSelectedDialog } from "./wikidata-manage-selected-dialog/wikidata-manage-selected-dialog";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface WikidataPropertiesPanelProps {
    selectedWdClassId: WdEntityId;
    rootWdClassSurroundings: WdClassSurroundings;
}

export const WikidataPropertiesPanel: React.FC<WikidataPropertiesPanelProps> = ({
    selectedWdClassId,
    rootWdClassSurroundings,
}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const wdPropertySelectionContext = useContext(WdPropertySelectionContext);
    const WdFilterByInstanceDialog = useDialog(WikidataFilterByInstanceDialog, ["setWdFilterByInstance"]);
    const [isValidSubclassingOfWdFilterByInstance, setIsValidSubclassingOfWdFilterByInstance] = useState(true);
    const WdManageSelectedDialog = useDialog(WikidataManageSelectedDialog);
    const [includeInheritedProperties, setIncludeInheritedProperties] = useState(false);
    const [wdFilterByInstance, setWdFilterByInstance] = useState<WdFilterByInstance | undefined>(undefined);
    const [searchText, setSearchText] = useState("");

    const rootWdClassIsSelected = selectedWdClassId === rootWdClassSurroundings.startClassId;
    const isInstanceFilterEmpty = wdFilterByInstance == null;
    return (
        <>
            <Typography variant='subtitle1' component='h2'>
                {t("associations attributes")}
            </Typography>
            <Stack direction='column' spacing={0.4} marginBottom={0.4} >
                <Stack direction='row' justifyContent="space-between">
                    <TextField
                        placeholder={t("wikidata.type to search")}
                        style={{ width: 247 }}
                        onChange={(e) => {
                            e.stopPropagation();
                            setSearchText(e.target.value);
                        }}
                        variant={"standard"}
                        autoComplete='off'
                        value={searchText}
                    />
                    <Button onClick={() => WdManageSelectedDialog.open({rootWdClassSurroundings})}
                        variant="contained" 
                        size="small" 
                        sx={{width: "247px"}}
                    >
                        {t("wikidata.show selected")} ({wdPropertySelectionContext.wdPropertySelectionRecords.length})
                    </Button>
                </Stack>
                <Stack flexDirection='row' alignItems='center'>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size='small'
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setIncludeInheritedProperties(e.target.checked);
                                    }}
                                />
                            }
                            label={t("wikidata.include inherited")}
                            />
                    </FormGroup>
                    <Button
                        style={{
                            maxWidth: "230px",
                            maxHeight: "30px",
                            minWidth: "230px",
                            minHeight: "30px",
                        }}
                        size='small'
                        color={isInstanceFilterEmpty ? "inherit" : "error"}
                        variant='contained'
                        onClick={() => {
                            const selectedWdClass = rootWdClassSurroundings.classesMap.get(selectedWdClassId) as WdClassDescOnly;
                            if (isInstanceFilterEmpty) {
                                WdFilterByInstanceDialog.open({selectedWdClass})
                            } else {
                                setWdFilterByInstance(undefined)
                                setIsValidSubclassingOfWdFilterByInstance(true);
                            }
                        }}
                    >
                        {isInstanceFilterEmpty
                            ? t("wikidata.add filter by instance")
                            : t("wikidata.remove filter by instance")}
                    </Button>
                    {!isValidSubclassingOfWdFilterByInstance && 
                            <Box marginLeft={2} display={"flex"}>
                                <WarningAmberIcon color='error' />
                                <Typography sx={{ marginLeft: 2 }} fontSize='15px' textAlign="justify">
                                    {t("wikidata.filter.subclassing error")} 
                                </Typography>
                            </Box>
                    }
                </Stack>
            </Stack>
            {rootWdClassIsSelected ? (
                <WikidataProperties
                    selectedWdClassSurroundings={rootWdClassSurroundings}
                    wdFilterByInstance={wdFilterByInstance}
                    searchText={searchText}
                    includeInheritedProperties={includeInheritedProperties}
                    setIsValidSubclassingOfWdFilterByInstance={setIsValidSubclassingOfWdFilterByInstance}
                />
            ) : (
                <WikidataLoadedProperties
                    selectedWdClassId={selectedWdClassId}
                    wdFilterByInstance={wdFilterByInstance}
                    searchText={searchText}
                    includeInheritedProperties={includeInheritedProperties}
                    setIsValidSubclassingOfWdFilterByInstance={setIsValidSubclassingOfWdFilterByInstance}
                />
            )}
            <WdFilterByInstanceDialog.Component setWdFilterByInstance={setWdFilterByInstance} />
            <WdManageSelectedDialog.Component />
        </>
    );
};

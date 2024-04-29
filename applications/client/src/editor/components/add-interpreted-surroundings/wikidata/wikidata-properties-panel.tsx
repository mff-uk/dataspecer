import {
    WdClassSurroundings,
    WdEntityId,
    WdFilterByInstance,
} from "@dataspecer/wikidata-experimental-adapter";
import {
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
import { useDialog } from "../../../dialog";
import { WikidataFilterByInstanceDialog } from "./wikidata-properties/wikidata-filter-by-instance-dialog/wikidata-filter-by-instance-dialog";
import { WdPropertySelectionContext } from "./contexts/wd-property-selection-context";
import { WikidataShowSelectedDialog } from "./wikidata-show-selected-dialog/wikidata-show-selected-dialog";

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
    const WdShowSelectedDialog = useDialog(WikidataShowSelectedDialog);
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
                        placeholder={t("type to search")}
                        style={{ width: 247 }}
                        onChange={(e) => {
                            e.stopPropagation();
                            setSearchText(e.target.value);
                        }}
                        variant={"standard"}
                        autoComplete='off'
                        value={searchText}
                        />
                    <Button onClick={() => WdShowSelectedDialog.open({rootWdClassSurroundings})}
                        variant="contained" 
                        size="small" 
                        sx={{width: "247px"}}
                    >
                        {t("show selected")} ({wdPropertySelectionContext.wdPropertySelectionRecords.length})
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
                            label={t("include inherited")}
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
                        onClick={() =>
                            isInstanceFilterEmpty
                                ? WdFilterByInstanceDialog.open({})
                                : setWdFilterByInstance(undefined)
                        }
                    >
                        {isInstanceFilterEmpty
                            ? t("add filter by instance")
                            : t("remove filter by instance")}
                    </Button>
                </Stack>
            </Stack>
            {rootWdClassIsSelected ? (
                <WikidataProperties
                    selectedWdClassSurroundings={rootWdClassSurroundings}
                    wdFilterByInstance={wdFilterByInstance}
                    searchText={searchText}
                    includeInheritedProperties={includeInheritedProperties}
                />
            ) : (
                <WikidataLoadedProperties
                    selectedWdClassId={selectedWdClassId}
                    wdFilterByInstance={wdFilterByInstance}
                    searchText={searchText}
                    includeInheritedProperties={includeInheritedProperties}
                />
            )}
            <WdFilterByInstanceDialog.Component setWdFilterByInstance={setWdFilterByInstance} />
            <WdShowSelectedDialog.Component />
        </>
    );
};
import { useMemo, useState } from "react";
import React from "react";
import {
    Typography,
    TextField,
    ListItem,
    List,
    IconButton,
    Box,
    Tooltip,
    ListItemText,
} from "@mui/material";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
    WdClassHierarchySurroundingsDescOnly,
    WdClassSurroundings,
    WdEntityId,
    WdEntityIdsList,
} from "@dataspecer/wikidata-experimental-adapter";
import { entitySearchTextFilterWithMap } from "./helpers/search-text-filter";
import { useTranslation } from "react-i18next";
import { LanguageStringText } from "../../helper/LanguageStringComponents";
import { useDialog } from "../../../dialog";
import { WikidataEntityDetailDialog } from "./wikidata-entity-detail-dialog/wikidata-entity-detail-dialog";

export interface AncestorsSelectorPanelProps {
    rootWdClassSurroundings: WdClassSurroundings;
    selectedWdClassId: WdEntityId;
    setSelectedWdClassId: React.Dispatch<React.SetStateAction<WdEntityId>>;
}

export const WikidataAncestorsSelectorPanel: React.FC<AncestorsSelectorPanelProps> = ({
    rootWdClassSurroundings,
    selectedWdClassId,
    setSelectedWdClassId,
}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const [searchText, setSearchText] = useState("");
    const WdEntityDetail = useDialog(WikidataEntityDetailDialog);

    const classesIdsToDisplay = useMemo<WdEntityIdsList>(() => {
        const classes = [
            rootWdClassSurroundings.startClassId,
            ...rootWdClassSurroundings.parentsIds,
        ];
        return entitySearchTextFilterWithMap(
            searchText,
            classes,
            rootWdClassSurroundings.classesMap,
        );
    }, [rootWdClassSurroundings, searchText]);

    return (
        <>
            <Typography variant='subtitle1' component='h2'>
                {t("ancestors title")}
            </Typography>
            <Box display={"flex"}>
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
            </Box>
            <List component='nav' aria-label='main mailbox folders' dense>
                {classesIdsToDisplay.map((clsId) => {
                    const cls = rootWdClassSurroundings.classesMap.get(
                        clsId,
                    ) as WdClassHierarchySurroundingsDescOnly;
                    const isSelected = selectedWdClassId === cls.id;
                    return (
                        <Tooltip
                            key={"tooltip" + cls.iri}
                            open={
                                Object.values(cls.descriptions).some((s) => s.length > 0)
                                    ? undefined
                                    : false
                            }
                            title={<LanguageStringText from={cls.descriptions} />}
                            placement='left'
                        >
                            <ListItem
                                button
                                selected={isSelected}
                                onClick={() => setSelectedWdClassId(cls.id)}
                            >
                                <ListItemText
                                    primary={
                                        <>
                                            <LanguageStringText from={cls.labels} />
                                        </>
                                    }
                                />
                                <IconButton 
                                    size='small' 
                                    onClick={(event) => { 
                                        event.stopPropagation();
                                        WdEntityDetail.open({wdEntity: cls})
                                    }}
                                >
                                    <InfoTwoToneIcon fontSize='inherit' />
                                </IconButton>
                            </ListItem>
                        </Tooltip>
                    );
                })}
            </List>
            <WdEntityDetail.Component />
        </>
    );
};

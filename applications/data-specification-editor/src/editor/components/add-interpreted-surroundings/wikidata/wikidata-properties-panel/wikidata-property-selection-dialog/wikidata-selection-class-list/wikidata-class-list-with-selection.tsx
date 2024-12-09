import {
    WdClassHierarchyDescOnly
} from "@dataspecer/wikidata-experimental-adapter";
import { Stack, TextField, Typography } from "@mui/material";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { entitySearchTextFilter } from "../../../helpers/search-text-filter";
import { WikidataInfinityScrollList } from "../../../helpers/wikidata-infinity-scroll-list";
import { WikidataClassItem } from "./wikidata-class-item";
import { useDialog } from "../../../../../../dialog";
import { WikidataEntityDetailDialog } from "../../../../../detail/wikidata-entity-detail/wikidata-entity-detail-dialog";

export interface ClassListProperties {
    wdClasses: WdClassHierarchyDescOnly[];
    selectedWdClass: WdClassHierarchyDescOnly | undefined;
    setSelectedWdClass: (wdClass: WdClassHierarchyDescOnly | undefined) => void;
    scrollableClassContentId: string;
}

export const WikidataClassListWithSelection: React.FC<ClassListProperties> = ({
    wdClasses,
    selectedWdClass,
    setSelectedWdClass,
    scrollableClassContentId,
}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const [searchText, setSearchText] = useState("");
    const WdEntityDetailDialog = useDialog(WikidataEntityDetailDialog);    
    const classesToDisplay = useMemo(() => {
        return entitySearchTextFilter(searchText, wdClasses);
    }, [wdClasses, searchText]);

    const mapWdClassFunc = useCallback(
        (wdClass: WdClassHierarchyDescOnly) => {
            return (
                <WikidataClassItem
                    key={wdClass.iri}
                    wdClass={wdClass}
                    selectedWdClass={selectedWdClass}
                    setSelectedWdClass={setSelectedWdClass}
                    openDetailDialogFunc={WdEntityDetailDialog.open}
                />
            );
        },
        [WdEntityDetailDialog.open, selectedWdClass, setSelectedWdClass],
    );

    return (
        <>
            <Stack direction='row' alignItems='center' spacing={2}>
                <TextField
                    placeholder={t("wikidata.type to search")}
                    sx={{ width: "35%" }}
                    onChange={(e) => {
                        e.stopPropagation();
                        setSearchText(e.target.value);
                    }}
                    variant={"standard"}
                    autoComplete='off'
                    value={searchText}
                />
                <Typography variant='body2' color='textSecondary'>
                    {t("wikidata.selection.number of classes")}: {classesToDisplay.length}
                </Typography>
            </Stack>
            <WikidataInfinityScrollList<WdClassHierarchyDescOnly>
                wdEntities={classesToDisplay}
                scrollableTargetId={scrollableClassContentId}
                mapWdEntityFunc={mapWdClassFunc}
            />
            <WdEntityDetailDialog.Component />
        </>
    );
};

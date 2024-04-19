import { WdClassSurroundings, WdEntityId } from "@dataspecer/wikidata-experimental-adapter";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { WikidataAssociations } from "./wikidata-associations/wikidata-associations";
import { WikidataLoadedAssociations } from "./wikidata-associations/wikidata-loaded-associations";


export interface WikidataAssociationsPanelProperties {
    selectedWdClassId: WdEntityId;
    rootWdClassSurroundings: WdClassSurroundings;
}

export const WikidataAssociationsPanel: React.FC<WikidataAssociationsPanelProperties> = ({selectedWdClassId, rootWdClassSurroundings}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const rootClassIsSelected = selectedWdClassId === rootWdClassSurroundings.startClassId;
    
    return (
        <>
            <Typography variant="subtitle1" component="h2">{t('associations attributes')}</Typography>
            {rootClassIsSelected ? (
                <WikidataAssociations
                    wdClassSurroundings={rootWdClassSurroundings}
                />
            ) : (
                <WikidataLoadedAssociations
                    selectedWdClassId={selectedWdClassId}
                />
            )}
        </>
    );
}
import { WdEntityDescOnly, WdEntityId, WdEntityIdsList, WdExternalOntologyMappings } from "@dataspecer/wikidata-experimental-adapter";
import { Box, Grid, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { entitySearchTextFilterWithMap } from "../../../add-interpreted-surroundings/wikidata/helpers/search-text-filter";
import { WikidataInfinityScrollList } from "../../../add-interpreted-surroundings/wikidata/helpers/wikidata-infinity-scroll-list";
import { LanguageStringUndefineable, LanguageStringText } from "../../../helper/LanguageStringComponents";

export const DETAIL_SCROLLABLE_TARGET_ID = "detail-list"

export interface WikidataEntityDetailGridProps {
    triples: FieldEntitiesContextTriples[];
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
} 

export interface FieldEntitiesContextTriples {
    field: string;
    values: WdEntityIdsList | WdExternalOntologyMappings;
    context?: ReadonlyMap<WdEntityId, WdEntityDescOnly>;
}



export const WikidataEntityDetailGrid: React.FC<WikidataEntityDetailGridProps> = ({triples, onNewDetailEntity}) => {
    const { t } = useTranslation("detail");
    const [selectionIdx, setSelectionIdx] = useState(0); 
    
    return (
        <Grid container spacing={3} marginTop={2}>
            <Grid
                item
                xs={3}
                sx={{ borderRight: (theme) => "1px solid " + theme.palette.divider}}
            >
                <List component='nav' aria-label='main mailbox folders'>
                    {triples.map((triple, idx) => {
                            return (                   
                                <ListItem
                                    key={triple.field}
                                    button
                                    selected={selectionIdx === idx}
                                    onClick={() => setSelectionIdx(idx)}
                                >
                                    <ListItemText primary={<>{t("wikidata." + triple.field)} ({triple.values.length})</>} />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Grid>
            <Grid item xs={9}>
                    {triples[selectionIdx].context !== undefined ?
                        <EntityListWithSearch 
                            wdEntityIds={triples[selectionIdx].values as WdEntityIdsList} 
                            onNewDetailEntity={onNewDetailEntity} 
                            context={triples[selectionIdx].context} 
                            scrollableTargetId={DETAIL_SCROLLABLE_TARGET_ID} 
                        /> :
                        <ExternalIdentifiersList 
                            identifiers={triples[selectionIdx].values as WdExternalOntologyMappings} 
                            onNewDetailEntity={onNewDetailEntity} 
                        />
                    }
            </Grid>
        </Grid>
    );
}

interface EntityListWithSearchProps {
    wdEntityIds: WdEntityIdsList;
    context: ReadonlyMap<WdEntityId, WdEntityDescOnly>;
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
    scrollableTargetId: string;
}

const EntityListWithSearch: React.FC<EntityListWithSearchProps> = ({wdEntityIds, context, onNewDetailEntity, scrollableTargetId}) => {
    const { t } = useTranslation("interpretedSurrounding")
    const [searchText, setSearchText] = useState("");

    const filteredEntities = useMemo(() => {
        const filteredEntityIds = entitySearchTextFilterWithMap(searchText, wdEntityIds, context);
        return filteredEntityIds.map((entityId) => context.get(entityId))
    }, [context, searchText, wdEntityIds])

    const entityMapFunc = useCallback((wdEntity: WdEntityDescOnly) => {
        return (
            <>
                <ListItem
                    key={wdEntity.iri}
                    role={undefined}
                    dense
                    button
                    onClick={() => onNewDetailEntity(wdEntity)}
                >
                    <ListItemText
                        secondary={
                            <Box style={{ display: "flex", gap: "1em" }}>
                                <LanguageStringUndefineable from={wdEntity.descriptions}>
                                    {(text) =>
                                        text !== undefined ? (
                                            <Typography
                                                variant='body2'
                                                color='textSecondary'
                                                component={"span"}
                                                noWrap
                                                title={text}
                                            >
                                                {text}
                                            </Typography>
                                        ) : (
                                            <></>
                                        )
                                    }
                                </LanguageStringUndefineable>
                            </Box>
                        }
                    >
                        <strong>
                            <LanguageStringText from={wdEntity.labels} />
                        </strong>
                    </ListItemText>
                </ListItem>
            </>
        )
    }, [onNewDetailEntity])

    return (
        <>
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
            <WikidataInfinityScrollList wdEntities={filteredEntities} mapWdEntityFunc={entityMapFunc} scrollableTargetId={scrollableTargetId} />
        </>
    )
}

interface ExternalIdentifiersListProps {
    identifiers: WdExternalOntologyMappings;
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
}

const ExternalIdentifiersList: React.FC<ExternalIdentifiersListProps> = ({identifiers}) => {

    return (
        <>
            {identifiers.map((id) => {
                return (
                    <>
                        <ListItem
                            divider
                            key={id}
                            role={undefined}
                            button
                            onClick={() => {
                                const newWindow = window.open(id, '_blank', 'noopener,noreferrer');
                                if (newWindow) newWindow.opener = null;
                            }}
                        >
                            <ListItemText>
                                {id}
                            </ListItemText>

                        </ListItem>
                    </>
                )
            })}
        </>
    )
}
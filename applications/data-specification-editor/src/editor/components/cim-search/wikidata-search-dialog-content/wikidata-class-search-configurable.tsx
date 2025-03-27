import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { useDialog } from "../../../dialog";
import React, { useContext } from "react";
import { WdClassSearchQuery, WdClassSearchRerankersIds, WdSearchClassesConfig, WdSearchRerankerConfig } from "@dataspecer/wikidata-experimental-adapter/wikidata-ontology-connector";
import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { WikidataPropertySearchDialog } from "./wikidata-property-search-dialog";
import { WdClassHierarchyDescOnly, WdEntityDescOnly, WdEntityId, WdPropertyDescOnly, isWdEntityPropertyDesc, isWdErrorResponse, loadWikidataClass } from "@dataspecer/wikidata-experimental-adapter";
import { LanguageStringUndefineable, LanguageStringText } from "../../helper/LanguageStringComponents";
import { WikidataEntityDetailDialog } from "../../detail/wikidata-entity-detail/wikidata-entity-detail-dialog";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../../wikidata/wikidata-adapter-context";
import { WikidataSearchResultsList } from "./wikidata-search-results-list";
import { WikidataSearchNotice } from "./helpers/wikidata-search-notice";
import { WikidataSearchBoostSlider } from "./helpers/wikidata-search-boost-slider";
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';

const MAX_INPUT_LENGTH = 200;
const SEARCH_CLASSES_QUERY_KEY = "search_classes_no_key"
const USAGE_BOOST_MAX_RESULTS = 30

export interface WikidataClassSearchConfigurableProps {
    isOpen: boolean,
    close: () => void,

    selected: (cls: PimClass) => void
    // Must not contain usage boost, since it is added by the user.
    searchConfig: WdSearchClassesConfig;
}

const create_usage_boost_config = (usageBoost: number): WdSearchRerankerConfig<WdClassSearchRerankersIds> => {
    return {
        id: "feature_instance_mappings",
        maxResults: USAGE_BOOST_MAX_RESULTS,
        queryWeight: (1 - usageBoost),
        featureWeights: [0.5]
    }
}

// Assuming there is no usage boost reranker.
function createSearchClassesConfig(searchConfig: WdSearchClassesConfig, wdClassSearchQuery: WdClassSearchQuery, usageBoost: number): WdSearchClassesConfig {
    const configCopy = {...searchConfig}
    if (usageBoost !== 0) {
        configCopy.rerankerConfig = [create_usage_boost_config(usageBoost), ...(configCopy?.rerankerConfig ?? [])];
    }
    configCopy.query = wdClassSearchQuery;
    console.log(configCopy);
    return configCopy;
}

export const WikidataClassSearchConfigurable: React.FC<WikidataClassSearchConfigurableProps> = ({close, selected, searchConfig}) => {
    const {t} = useTranslation("search-dialog");
    const wikidataAdapter = useContext(WikidataAdapterContext);
    const [selectedWdProperties, setSelectedWdProperties] = React.useState<WdPropertyDescOnly[]>([]);
    const [usageBoost, setUsageBoost] = React.useState<number>(0)
    const [classQuery, setClassQuery] = React.useState<WdClassSearchQuery>({ text: "", properties: []});
    const AddWdPropertyDialog = useDialog(WikidataPropertySearchDialog);
    const [results, setResults] = React.useState<WdClassHierarchyDescOnly[] | null>(null);
    const {data, isError, isFetching, refetch} = useQuery([SEARCH_CLASSES_QUERY_KEY], async () => {
        const queryConfig = createSearchClassesConfig(searchConfig, classQuery, usageBoost);
        const response = await wikidataAdapter.wdAdapter.wdOntologyConnector.postSearchClasses(queryConfig);
        if (!isWdErrorResponse(response)) {
            setResults(response.results);
        }
        return response;
    }, { refetchOnWindowFocus: false, enabled: false },)

    function addSelectedWdProperty(wdProperty: WdPropertyDescOnly): void {
        if (!classQuery.properties.includes(wdProperty.id)) {
            const newWdPropertiesIds = [...classQuery.properties, wdProperty.id]
            setClassQuery({...classQuery, properties: newWdPropertiesIds})
            setSelectedWdProperties([...selectedWdProperties, wdProperty])
        }
    }

    function removeSelectedWdProperty(wdPropertyId: WdEntityId): void {
        const filteredWdProperties = selectedWdProperties.filter((wdProperty) => wdProperty.id !== wdPropertyId);
        setClassQuery({...classQuery, properties: filteredWdProperties.map(v => v.id)})
        setSelectedWdProperties(filteredWdProperties)
    }

    function onWdClassSelect(wdClass: WdClassHierarchyDescOnly): void {
        const pimClass = loadWikidataClass(wdClass, wikidataAdapter.iriProvider)
        selected(pimClass);
        close()
    };

    const queryFailed = isError || (isWdErrorResponse(data))

    return (
        <>
            <Typography fontSize={20}>{t("wikidata.class description")}:</Typography>
            <Stack direction="column" marginTop={1} marginLeft={2} marginRight={2}>
                <Box display={"flex"} >
                    <TextField
                        placeholder={t("wikidata.placeholder")}
                        size="medium"
                        fullWidth
                        onChange={e => setClassQuery({...classQuery, text: e.target.value})}
                        autoComplete="off"
                        value={classQuery.text}
                        error={isError}
                        inputProps={{maxLength: MAX_INPUT_LENGTH}}
                    />
                    <Button
                        style={{marginLeft: "1rem", width: 100}}
                        variant="contained"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        {isFetching ? <CircularProgress color="inherit" />: t("wikidata.search")}
                    </Button>
                </Box>
                <Typography sx={{marginLeft: 2, color: "#818181"}} fontSize={13}>{classQuery.text.length.toString()}/{MAX_INPUT_LENGTH.toString()}</Typography>
                <WikidataSearchBoostSlider infoText={t("wikidata.boost classes")} tooltipText={t("wikidata.boost classes tooltip")} onChange={(value: number) => setUsageBoost(value)} />
                <Typography sx={{marginTop: 2}} fontSize={18}>{t("wikidata.properties")}:</Typography>
                <SelectedPropertiesList wdProperties={selectedWdProperties} removeProperty={removeSelectedWdProperty} detailOnWdClassSelect={onWdClassSelect}/>
                <Box display="flex" justifyContent="center">
                    <Button
                        startIcon={<AddBoxIcon/>}
                        sx={{width: 190, height: 25}}
                        color="info"
                        size="small"
                        variant="contained"
                        onClick={() => AddWdPropertyDialog.open({onWdPropertySelect: addSelectedWdProperty, onWdClassSelect: onWdClassSelect})}
                        >
                        {t("wikidata.add property")}
                    </Button>
                </Box>
            </Stack>
            <Stack direction={"row"} alignItems="center">
                <Typography marginTop={1} marginRight={3} fontSize={20}>{t("wikidata.search results")}:</Typography>
                { isError &&
                    <Stack direction="row" marginTop={1}>
                        <ReportGmailerrorredOutlinedIcon color="error"/>
                        <Typography color="error" fontSize={17}>{t("wikidata.search error")}</Typography>
                    </Stack>
                }
            </Stack>
            {queryFailed && !isFetching && <WikidataSearchNotice key={"error"} isProgress={false} isError={true} height={150}/>}
            {!queryFailed && isFetching && <WikidataSearchNotice key={"loading"} isProgress={true} isError={false} height={150}/>}
            {!queryFailed && !isFetching && results && results.length !== 0 &&
                <WikidataSearchResultsList<WdClassHierarchyDescOnly>
                    results={results}
                    onSelect={onWdClassSelect}
                    detailOnSelect={onWdClassSelect}
                    detailOnSelectDiabledWhen={(entity: WdEntityDescOnly) => isWdEntityPropertyDesc(entity)}
                    detailOnSelectButtonText={(_: WdEntityDescOnly) => t("wikidata.select as root")}
                />
            }
            {!queryFailed && !isFetching && results && results.length === 0 &&
                <WikidataSearchNotice key={"nothing"} isProgress={false} isError={false} height={150} message={t("info panel nothing found")}/>
            }
            <AddWdPropertyDialog.Component />
        </>
    );
}

interface SelectedWdPropertiesListProps {
    wdProperties: WdPropertyDescOnly[];
    removeProperty: (wdPropertyId: WdEntityId) => void;
    detailOnWdClassSelect: (wdClass: WdClassHierarchyDescOnly) => void;
}

const SelectedPropertiesList: React.FC<SelectedWdPropertiesListProps> = ({wdProperties, removeProperty, detailOnWdClassSelect}) => {
    const {t: tUI} = useTranslation("ui")
    const {t: tSearch} = useTranslation("search-dialog")
    const WdPropertyDetail = useDialog(WikidataEntityDetailDialog)

    return (
        <>
            <List component='nav' aria-label='main mailbox folders' dense>
                {wdProperties.map((wdProperty) => {
                    return (
                        <ListItem key={wdProperty.iri} role={undefined} dense>
                            <ListItemText
                                secondary={
                                    <>
                                        <Box style={{ display: "flex", gap: "1em" }}>
                                            <LanguageStringUndefineable from={wdProperty.descriptions}>
                                                {(text) =>
                                                    text !== undefined ? (
                                                        <Typography
                                                            variant='body2'
                                                            color='textSecondary'
                                                            component={"span"}
                                                            noWrap
                                                            width={650}
                                                        >
                                                            {text}
                                                        </Typography>
                                                    ) : (
                                                        <></>
                                                    )
                                                }
                                            </LanguageStringUndefineable>
                                        </Box>
                                    </>
                                }
                                primary={
                                    <>
                                        <Stack direction="row" spacing={1}>
                                            <strong>
                                                <LanguageStringText from={wdProperty.labels} />
                                            </strong>
                                            <Typography fontSize={13}>
                                                (P{wdProperty.id.toString()})
                                            </Typography>
                                        </Stack>
                                    </>
                                }
                            >
                            </ListItemText>
                            <ListItemSecondaryAction>
                                <IconButton
                                    size='small'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        WdPropertyDetail.open({
                                            wdEntity: wdProperty,
                                            onSelect: detailOnWdClassSelect,
                                            onSelectButtonText: (entity: WdEntityDescOnly) => tSearch("wikidata.select as root"),
                                            onSelectButtonDisableWhen: (wdEntity: WdEntityDescOnly) => isWdEntityPropertyDesc(wdEntity)
                                        });
                                    }}
                                    sx={{marginRight: 3}}
                                >
                                    <InfoTwoToneIcon fontSize='inherit' />
                                </IconButton>
                                <Button
                                    onClick={() => removeProperty(wdProperty.id)}
                                    color="error"
                                >
                                    {tUI("delete")}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </List>
            <WdPropertyDetail.Component />
        </>
    )
}
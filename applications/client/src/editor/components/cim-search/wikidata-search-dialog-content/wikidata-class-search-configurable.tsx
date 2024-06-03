import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { DialogParameters, useDialog } from "../../../dialog";
import React from "react";
import { WdClassSearchQuery } from "@dataspecer/wikidata-experimental-adapter/lib/wikidata-ontology-connector/api-types/post-experimental-search";
import { Box, Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { WikidataPropertySearchDialog } from "./wikidata-property-search-dialog";
import { WdEntityId, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { LanguageStringUndefineable, LanguageStringText } from "../../helper/LanguageStringComponents";
import { WikidataEntityDetailDialog } from "../../detail/wikidata-entity-detail/wikidata-entity-detail-dialog";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";

const MAX_LENGTH = 200;

const CONFIG_DEFAULT = `{
 "candidateSelectorConfig": {
    "id": "qdrant_dense",
    "maxResults": 10
 }
 ,
 "fusionCandidateSelectorConfig": {
     "id": "fusion",
     "maxResults": 20,
     "fusionWeights": [0.5],
     "candidateSelectors": [
         {
             "id": "qdrant_dense",
             "maxResults": 100
         },
         {
             "id": "qdrant_sparse",
             "maxResults": 100
         }
     ]
 }
 ,
 "rerankerConfig": [
    {
        "id": "feature_instance_mappings",
        "maxResults": 30,
        "queryWeight": 0.6,
        "featureWeights": [0.5]
    }, 
    {
         "id": "cross_encoder",
         "maxResults": 30
    }
 ]
}
`

export const WikidataClassSearchConfigurable: React.FC<DialogParameters & {selected: (cls: PimClass) => void}> = ({close, isOpen, selected}) => {
    const {t} = useTranslation("search-dialog");
    const [configText, setConfigText] = React.useState<string>(CONFIG_DEFAULT);
    const [selectedWdProperties, setSelectedWdProperties] = React.useState<WdPropertyDescOnly[]>([]);
    const [classQuery, setClassQuery] = React.useState<WdClassSearchQuery>({ text: "", properties: []});
    const AddWdPropertyDialog = useDialog(WikidataPropertySearchDialog);

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

    return (
        <>
            {/* <TextField
                    label={"config"}
                    multiline
                    fullWidth
                    size="small"
                    onChange={e => setConfigText(e.target.value)}
                    autoComplete="off"
                    value={configText}
            /> */}
            <Typography fontSize={19}>{t("wikidata.class description")}:</Typography>
            <Stack direction="column" marginTop={1} marginLeft={2} marginRight={2}>
                <Box display={"flex"} >
                    <TextField
                        placeholder={t("wikidata.placeholder")}
                        size="medium"
                        fullWidth
                        autoFocus
                        onChange={e => setClassQuery({...classQuery, text: e.target.value})}
                        autoComplete="off"
                        value={classQuery.text}
                        inputProps={{maxLength: MAX_LENGTH}}
                    />
                    <Button style={{marginLeft: "1rem"}} variant="contained">{t("wikidata.search")}</Button>
                </Box>
                <Typography sx={{marginLeft: 2, color: "#818181"}} fontSize={13}>{classQuery.text.length.toString()}/{MAX_LENGTH.toString()}</Typography>
                <Typography sx={{marginTop: 1}} fontSize={16}>{t("wikidata.properties")}:</Typography>
                <SelectedPropertiesList wdProperties={selectedWdProperties} removeProperty={removeSelectedWdProperty}/>
                <Box display="flex" justifyContent="center">
                    <Button 
                        startIcon={<AddBoxIcon/>}
                        sx={{width: 190, height: 25}} 
                        color="info" 
                        size="small" 
                        variant="contained"
                        onClick={() => AddWdPropertyDialog.open({onSelect: addSelectedWdProperty})}
                        >
                        {t("wikidata.add property")}
                    </Button>    
                </Box>
            </Stack>
            <Typography marginTop={1} fontSize={19}>{t("wikidata.search results")}:</Typography>
            <AddWdPropertyDialog.Component />
        </>
    );
}

interface SelectedWdPropertiesListProps {
    wdProperties: WdPropertyDescOnly[];
    removeProperty: (wdPropertyId: WdEntityId) => void;
}

const SelectedPropertiesList: React.FC<SelectedWdPropertiesListProps> = ({wdProperties, removeProperty}) => {
    const {t} = useTranslation("ui")
    const WdPropertyDetail = useDialog(WikidataEntityDetailDialog)
    
    return (
        <>
            <List component='nav' aria-label='main mailbox folders' dense>
                {wdProperties.map((wdProperty) => {
                    return (
                        <ListItem key={wdProperty.iri} role={undefined}>
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
                                        WdPropertyDetail.open({wdEntity: wdProperty})
                                    }}
                                    sx={{marginRight: 3}}
                                >
                                    <InfoTwoToneIcon fontSize='inherit' />
                                </IconButton>
                                <Button
                                    onClick={() => removeProperty(wdProperty.id)} 
                                    color="error"
                                >
                                    {t("delete")}
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
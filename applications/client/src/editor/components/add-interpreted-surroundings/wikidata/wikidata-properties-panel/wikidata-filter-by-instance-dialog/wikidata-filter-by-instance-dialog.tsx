import { WdClassDescOnly, WdEntityId, WdFilterByInstance, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { dialog } from "../../../../../dialog";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../../../../wikidata/wikidata-adapter-context";
import { Box, Button, DialogActions, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DialogContent, DialogTitle } from "../../../../detail/common";
import { LanguageStringText } from "../../../../helper/LanguageStringComponents";
import { useWdGetExampleInstances } from "../../hooks/use-wd-get-example-instance";
import { WikidataLoadingError } from "../../helpers/wikidata-loading-error";
import { WikidataLoading } from "../../helpers/wikidata-loading";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export interface WikidataFilterByInstanceDialogProps {
    isOpen: boolean;
    close: () => void;

    setWdFilterByInstance: React.Dispatch<React.SetStateAction<WdFilterByInstance>>;
    selectedWdClass: WdClassDescOnly;
}

export const WikidataFilterByInstanceDialog: React.FC<WikidataFilterByInstanceDialogProps> = dialog(
    { fullWidth: true, maxWidth: "md", PaperProps: { sx: { height: "90%" } } },
    ({ isOpen, close, setWdFilterByInstance, selectedWdClass }) => {
        const { t } = useTranslation("interpretedSurrounding");
        const wikidataAdapter = useContext(WikidataAdapterContext);
        const [wasApplied, setWasApplied] = useState(false);
        const [instanceUri, setInstanceUri] = useState<string>("");
        const { isLoading, isError, data, refetch } = useQuery(
            ["filterByInstance", instanceUri],
            async () => {
                return await wikidataAdapter.wdAdapter.wdOntologyConnector.getFilterByInstance(instanceUri);
            },
            { refetchOnWindowFocus: false, enabled: false },
        );

        const queryFailed = useMemo(() => {
            return (
                wasApplied &&
                !isLoading &&
                (isError || isWdErrorResponse(data) || (data != null && data.instanceOfIds.length === 0))
            );
        }, [wasApplied, isError, isLoading, data]);
        
        // Clear form on close.
        useEffect(() => {
            if (!isOpen) {
                setInstanceUri("");
                setWasApplied(false);
            }
        }, [isOpen]);

        // Assign data upon refetch finish.
        useEffect(() => {
            if (wasApplied && data != null && !queryFailed) {
                setWdFilterByInstance(data as WdFilterByInstance);
                close();
            }
        }, [close, data, queryFailed, setWdFilterByInstance, isLoading, wasApplied]);

        return (
            <>
                <DialogTitle id='customized-dialog-title' close={close}>
                    {t("wikidata.add filter by instance")}
                </DialogTitle>
                <DialogContent dividers >
                    {isLoading && <WikidataLoading />}
                    {!isLoading && (
                        <>
                            <TextField
                                label={t("wikidata.filter.uri input")}
                                autoFocus
                                fullWidth
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setInstanceUri(e.target.value);
                                }}
                                variant={"standard"}
                                autoComplete='off'
                                disabled={isLoading}
                                value={instanceUri}
                                error={queryFailed}
                                helperText={
                                    <>
                                        {queryFailed && t("wikidata.filter.error")}
                                    </>
                                }
                                />
                            <Stack direction={"column"} marginTop={3}>
                                <InputIRIConditionsHelpBox />
                                <InstanceSearchHelpBox selectedWdClass={selectedWdClass}/>
                                <DirectInstanceSearchHelpBox selectedWdClass={selectedWdClass}/>
                                <SparqlQueryExamplesHelpBox selectedWdClass={selectedWdClass} />
                            </Stack>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t("close button")}</Button>
                    <Button
                        onClick={() => {
                            refetch();
                            setWasApplied(true);
                        }}
                        disabled={isLoading || instanceUri === ""}
                        >
                        {t("confirm button")}
                    </Button>
                </DialogActions>
            </>
        );
    },
);


interface HelpBoxProps {
    selectedWdClass: WdClassDescOnly;
}


const InputIRIConditionsHelpBox: React.FC = () => {
    const { t } = useTranslation("interpretedSurrounding");
    return (
        <>
            <Typography fontSize={18}>{t("wikidata.filter.constraints title")}</Typography>
            <Box fontSize={15}>
                <ul>
                    <li>{t("wikidata.filter.constraints help 1")} <i>item</i> {t("wikidata.filter.constraints help 15")} <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="_blank" rel="noreferrer">Wikidata</a> ({t("wikidata.filter.constraints help 17")}).</li>
                    <li><i>Item</i> {t("wikidata.filter.constraints help 2")} <b>instance of</b>.</li>
                    <li><i>Item</i> {t("wikidata.filter.constraints help 4")} <b>subclass of</b>.</li>
                    <li>{t("wikidata.filter.constraints help 3")} <b>https?://www.wikidata.org/(entity|wiki)/[Q][1-9][0-9]*</b></li>
                </ul>
            </Box>
        </>
    );
}


function createLinkToSparqlQueryAncestors(wdClassId: WdEntityId): string {
    return `https://query.wikidata.org/#PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0A%0ACONSTRUCT%20%7B%0A%20%20%3Finstance%20rdfs%3Alabel%20%3FinstanceLabel%20.%0A%7D%20WHERE%20%7B%0A%20%20%23%20Sub%20query%2C%20otherwise%20it%20looses%20priority%20ordering%20from%20Wikidata.%0A%20%20SELECT%20%3Finstance%20%3FinstanceLabel%0A%20%20WHERE%20%7B%0A%20%20%20%20%23%20Instances%20of%20ancestors%20%28exlucing%20the%20starting%20one%29.%0A%20%20%20%20%3Finstance%20wdt%3AP31%20%3Fancestor%20.%0A%20%20%20%20%3Fancestor%20%5Ewdt%3AP279%2B%20wd%3AQ${wdClassId.toString()}%20.%0A%20%20%20%20%0A%20%20%20%20%23%20Filter%20out%20everything%20that%20is%20not%20an%20item.%0A%20%20%20%20FILTER%28STRSTARTS%28STR%28%3Finstance%29%2C%20CONCAT%28STR%28wd%3A%29%2C%20%22Q%22%29%29%29%0A%0A%20%20%20%20%23%20The%20instance%20must%20not%20be%20a%20class.%0A%20%20%20%20FILTER%20NOT%20EXISTS%20%7B%20%3Finstance%20wdt%3AP279%20%3FinstanceClass%20%7D%0A%20%20%20%20%0A%20%20%20%20%23%20Obtaining%20labels%20for%20instances.%0A%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%0A%0A%20%20%7D%20LIMIT%205%0A%7D`
} 

function createLinkToSparqlQueryChildren(wdClassId: WdEntityId): string {
    return `https://query.wikidata.org/#PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0A%0ACONSTRUCT%20%7B%0A%20%20%3Finstance%20rdfs%3Alabel%20%3FinstanceLabel%20.%0A%7D%20WHERE%20%7B%0A%20%20%23%20Sub%20query%2C%20otherwise%20it%20looses%20priority%20ordering%20from%20Wikidata.%0A%20%20SELECT%20%3Finstance%20%3FinstanceLabel%0A%20%20WHERE%20%7B%0A%20%20%20%20%23%20Direct%20instances%20and%20instances%20of%20child%20classes.%0A%20%20%20%20wd%3AQ${wdClassId.toString()}%20%5Ewdt%3AP279%2a%2F%5Ewdt%3AP31%20%3Finstance%20.%20%0A%0A%20%20%20%20%23%20Filter%20out%20everything%20that%20is%20not%20an%20item.%0A%20%20%20%20FILTER%28STRSTARTS%28STR%28%3Finstance%29%2C%20CONCAT%28STR%28wd%3A%29%2C%20%22Q%22%29%29%29%0A%0A%20%20%20%23%20The%20instance%20must%20not%20be%20a%20class.%0A%20%20%20%20FILTER%20NOT%20EXISTS%20%7B%20%3Finstance%20wdt%3AP279%20%3FinstanceClass%20%7D%0A%0A%20%20%20%20%23%20Obtaining%20labels%20for%20instances.%0A%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%0A%0A%20%20%7D%20LIMIT%205%0A%7D`
} 

const InstanceSearchHelpBox: React.FC<HelpBoxProps> = ({selectedWdClass}) => {
    const { t } = useTranslation("interpretedSurrounding");
    return (
        <>
            <Typography fontSize={18}>{t("wikidata.filter.search title")}</Typography>
            <Box fontSize={15}>
                <ul>
                    <li>
                        {t("wikidata.filter.search help 1")} <a href="https://www.wikidata.org/w/index.php?search=&search=&title=Special:Search&go=Go" target="_blank" rel="noreferrer">Wikidata</a>
                        {" "}(<a href="https://www.mediawiki.org/wiki/Help:Extension:WikibaseCirrusSearch" target="_blank" rel="noreferrer">{t("wikidata.filter.search help 6")}</a>).
                    </li>
                    <li>
                        {t("wikidata.filter.search help 2")} <a href="https://query.wikidata.org/" target="_blank" rel="noreferrer">SPARQL</a>
                        {" "}(<a href="https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/A_gentle_introduction_to_the_Wikidata_Query_Service" target="_blank" rel="noreferrer">{t("wikidata.filter.search help 6")}</a>).
                    </li>
                    <li>
                        {t("wikidata.filter.search help 3")}
                    </li>
                    <li>
                        {t("wikidata.filter.search help 4")} 
                            <ul>
                                <li>
                                    {t("wikidata.filter.search help 4-1")}<a href={createLinkToSparqlQueryChildren(selectedWdClass.id)} target="_blank" rel="noreferrer">{t("wikidata.filter.search help 5")}</a>.
                                </li>
                                <li>
                                    {t("wikidata.filter.search help 4-2")}<a href={createLinkToSparqlQueryAncestors(selectedWdClass.id)} target="_blank" rel="noreferrer">{t("wikidata.filter.search help 5")}</a>.
                                </li>
                                <li>
                                    {t("wikidata.filter.search help 7")}
                                </li>
                            </ul> 
                    </li>
                </ul>
            </Box>
        </>
    );
}


function createLinkToMainSearch(text: string, wdClassId: WdEntityId): string {
    const encodedText = encodeURI(text.replaceAll(/\s/g, "+"));
    return `https://www.wikidata.org/w/index.php?search=${encodedText}+haswbstatement%3AP31%3DQ${wdClassId.toString()}+-haswbstatement%3AP279&title=Special:Search&profile=advanced&fulltext=1&ns0=1`
}

const DirectInstanceSearchHelpBox: React.FC<HelpBoxProps> = ({selectedWdClass}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const [inputText, setInputText] = useState("");

    function onSearchOnWikidataClick() {
        const newWindow = window.open(createLinkToMainSearch(inputText, selectedWdClass.id), '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    return (
        <>
            <Typography fontSize={18}>{t("wikidata.filter.direct search title")}: <strong><LanguageStringText from={selectedWdClass.labels}/></strong></Typography>
            <Stack spacing={3} marginTop={1} direction="row" display={"flex"} justifyContent={"center"} alignItems={"center"}>
                <TextField
                    style={{width: 500}}
                    label={<>{t("wikidata.filter.direct search label")}</>}
                    onChange={(e) => {
                        e.stopPropagation();
                        setInputText(e.target.value);
                    }}
                    variant={"standard"}
                    autoComplete='off'
                    value={inputText}
                />
                <Button 
                    size="medium" 
                    variant="contained" 
                    onClick={onSearchOnWikidataClick}
                >
                   {t("wikidata.filter.direct search button")}
                </Button>
            </Stack>
        </>
    );
}

const SparqlQueryExamplesHelpBox: React.FC<HelpBoxProps> = ({selectedWdClass}) => {
    const { t } = useTranslation("interpretedSurrounding");
    const { exampleWdInstances, isError, isLoading} = useWdGetExampleInstances(selectedWdClass);
    
    return (
        <>
            <Typography marginTop={2} fontSize={18}>{t("wikidata.filter.sparql title")}</Typography>
            {isLoading && <WikidataLoading />}
            {isError && <WikidataLoadingError errorMessage={t("wikidata.filter.sparql error")}/>}
            {!isLoading && !isError &&
                <List>
                    {exampleWdInstances.map((example) => {
                        return (
                            <>
                                <ListItem key={example.iri} divider>
                                    <ListItemText 
                                        primary={example?.label ?? <i>unamed</i>} 
                                        secondary={<a href={example.iri} target="_blank" rel="noreferrer">{example.iri}</a>}
                                    />
                                    <Button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigator.clipboard.writeText(example.iri);
                                        }}
                                        startIcon={<ContentCopyIcon fontSize='inherit' />}
                                    >
                                        {t("wikidata.filter.copy to clipboard")}
                                    </Button>
                                </ListItem>
                            </>
                        )
                    })}
                </List>
            }
        </>
    );
}
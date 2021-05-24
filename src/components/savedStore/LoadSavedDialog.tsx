import {
    Backdrop,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Typography
} from "@material-ui/core";
import React, {useMemo, useState} from "react";
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {FederatedSource, JsonldSource, PlatformModelAdapter, SparqlSource, Store} from 'model-driven-data';

const jsonSources = [
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-ofn-číselníky.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-adresní-místa.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-datové-schránky.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-orgány-veřejné-moci.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-osoby-právní-forma.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-pracoviště.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-ustanovení-právních-předpisů.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-rpp-zařazení-do-kategorií.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-ustanovení-právních-předpisů.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-ofn-číselníky.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-adresní-místa.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-datové-schránky.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-orgány-veřejné-moci.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-osoby-právní-forma.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-pracoviště.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-ustanovení-právních-předpisů.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/psm-rpp-zařazení-do-kategorií.ttl",
    "https://raw.githubusercontent.com/opendata-mvcr/model-driven-data/master/test/pim-ustanovení-právních-předpisů.ttl",
];

const predefinedSchemas = [
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů",
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií",
];

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: "#fff"
        }
    })
);

export const LoadSavedDialog: React.FC<{isOpen: boolean, close: () => void, store: (store: Store) => void}> = ({isOpen, close, store}) => {
    const classes = useStyles();
    const [loading, setLoading] = useState<string | null>(null);

    const preload = useMemo(() => async (iri: string) => {
        const sources = [];

        for (let i = 0; i < jsonSources.length; i++) {
            setLoading(`processing: ${jsonSources[i]}`);
            sources.push(await JsonldSource.create(jsonSources[i], "text/turtle"));
        }

        setLoading(`processing...`);

        sources.push(await SparqlSource.create("https://slovník.gov.cz/sparql"));

        const source = FederatedSource.createExhaustive(sources);
        const adapter = PlatformModelAdapter.create(source);
        await adapter.loadIriTree(iri);
        const entities = adapter.get();

        setLoading(null);
        close();
        store(entities);
    }, [close, store]);

    return <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle id="customized-dialog-title">
            Load saved from GH
        </DialogTitle>
        <DialogContent dividers>
            <Backdrop className={classes.backdrop} open={!!loading}>
                <div style={{"textAlign": "center"}}>
                    <Typography variant="h5">{loading}</Typography>
                    <CircularProgress color="inherit"/>
                </div>
            </Backdrop>
            <List dense component="nav" aria-label="secondary mailbox folders">
                {predefinedSchemas.map(result =>
                    <ListItem button key={result} onClick={() => {preload(result);}}>
                        <ListItemText>{result}</ListItemText>
                    </ListItem>
                )}
            </List>
        </DialogContent>
    </Dialog>;
}
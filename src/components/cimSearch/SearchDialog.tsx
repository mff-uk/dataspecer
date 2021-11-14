import {Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, TextField, Theme, Typography} from "@mui/material";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {createStyles, makeStyles} from '@mui/styles';
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {useTranslation} from "react-i18next";
import {PimClass} from "model-driven-data/pim/model";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {StoreContext} from "../App";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import {useDialog} from "../../hooks/useDialog";
import {PimClassDetailDialog} from "../detail/pim-class-detail-dialog";
import {ReadOnlyMemoryStore} from "model-driven-data/core";
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import {CloseDialogButton} from "../detail/components/close-dialog-button";
import {FederatedObservableStore} from "../../store/federated-observable-store";
import {StoreMetadataTag} from "../../configuration/configuration";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            overflow: 'auto',
            maxHeight: 450,
            margin: theme.spacing(2, 0, 0, 0),
        },
    }),
);

export const SearchDialog: React.FC<{isOpen: boolean, close: () => void, selected: (cls: PimClass) => void}> = ({isOpen, close, selected}) => {
    const {cim} = React.useContext(StoreContext);
    const classes = useStyles();
    const [findResults, updateFindResults] = useState<PimClass[] | null>(null);
    const [subject, setSubject] = useState<BehaviorSubject<string> | null>(null);
    const [loading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const {t} = useTranslation("search-dialog");

    const detailDialog = useDialog(PimClassDetailDialog, ["iri"]);

    // Following code creates a new store context containing downloaded data. This allow us to use standard application
    // components which render dialogs and other stuff

    const storeContext = useContext(StoreContext);
    const [store] = useState(() => new FederatedObservableStore());
    const NewStoreContext = useMemo(() => ({...storeContext, store}), [storeContext, store]);
    useEffect(() => {
        const readOnlyMemoryStore = ReadOnlyMemoryStore.create(Object.fromEntries(findResults?.map(r => [r.iri, r]) ?? []));
        const storeWithMetadata = {
            store: readOnlyMemoryStore,
            metadata: {
                tags: ["cim-as-pim"] as StoreMetadataTag[]
            },
        };
        store.addStore(storeWithMetadata);
        return () => store.removeStore(storeWithMetadata);
    }, [findResults]);

    useEffect(() => {
        const subject = new BehaviorSubject('');
        setSubject(subject);
        subject.subscribe(() => setError(false));
        subject.pipe(
            debounceTime(200)
        ).subscribe(term => {
            if (term) {
                setLoading(true);
                cim.cimAdapter.search(term).then(result => {
                    updateFindResults(result);
                    setLoading(false);
                }).catch(error => {
                    console.info("Error during search.", error);
                    setError(true);
                    setLoading(false);
                });
            } else {
                updateFindResults(null);
            }
        });

        // When the component unmounts, this will clean up the
        // subscription
        return () => subject.unsubscribe();
    }, []);

    const onChange = (e: any) => {
        if (subject) {
            return subject.next(e.target.value);
        }
    };

    return <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle>
            {t("title")}

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <Box display={"flex"}>
                <TextField id="standard-basic" placeholder={t("placeholder")} fullWidth autoFocus onChange={onChange}
                           error={isError} variant={"standard"} autoComplete="off" />
                <CircularProgress style={{marginLeft: "1rem"}} size={30} value={0} variant={loading ? "indeterminate" : "determinate"}/>
            </Box>
            <List className={classes.root} dense component="nav" aria-label="secondary mailbox folders"
                   sx={{
                       overflow: 'auto',
                       maxHeight: 500,
                       height: 500
                   }}
            >
                {findResults && findResults.map((result: PimClass) =>
                    <ListItem button key={result.pimInterpretation} onClick={() => {
                        selected(result);
                        close();
                    }}>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap
                                                             title={result.pimHumanDescription?.cs}>{result.pimHumanDescription?.cs}</Typography>}>
                            <strong>{result.pimHumanLabel?.cs}</strong>
                            {" "}
                            <SlovnikGovCzGlossary cimResourceIri={result.pimInterpretation as string}/>
                        </ListItemText>
                        <IconButton onClick={e => {
                            e.stopPropagation();
                            detailDialog.open({iri: result.iri as string})
                        }}>
                            <InfoTwoToneIcon/>
                        </IconButton>
                    </ListItem>
                )}

                {(!findResults || findResults.length === 0) &&
                <Box sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: (theme) => theme.palette.grey[500],
                    flexDirection: "column",
                }}>
                    {!findResults && <><SearchIcon sx={{display: "block", height: "4rem", width: "4rem"}} />{t('info panel start typing')}</>}
                    {findResults && <><SearchOffIcon sx={{display: "block", height: "4rem", width: "4rem"}} />{t('info panel nothing found')}</>}
                </Box>}
            </List>
        </DialogContent>
        <StoreContext.Provider value={NewStoreContext}>
            <detailDialog.component />
        </StoreContext.Provider>
    </Dialog>;
};

import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    TextField,
    Theme,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {createStyles, makeStyles} from '@mui/styles';
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {useTranslation} from "react-i18next";
import {PimClass} from "model-driven-data/pim/model";
import {SlovnikGovCzGlossary} from "../slovnik.gov.cz/SlovnikGovCzGlossary";
import {StoreContext} from "../App";
//import {SelectGlossaryButton} from "../slovnik.gov.cz/selectGlossary/SelectGlossaryButton";
//import {useAsyncMemo} from "../../hooks/useAsyncMemo";

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
    const {cim/*, filteredOutGroups*/} = React.useContext(StoreContext);
    const classes = useStyles();
    const [findResults, updateFindResults] = useState<PimClass[]>([]);
    const [subject, setSubject] = useState<BehaviorSubject<string> | null>(null);
    const [loading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const {t} = useTranslation("search-dialog");

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
                updateFindResults([]);
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

/*    const [wrapped] = useAsyncMemo<[{resource: PimClass, group: string[]}[], string[]]>(async () => {
        const wrappedResults = [];
        const groups = [];
        for (const resource of findResults) {
            const group = await cim.cimAdapter.getResourceGroup(resource.pimInterpretation as string);
            wrappedResults.push({
               resource,
               group,
            });
            groups.push(...group);
        }

        return [wrappedResults, groups];
    }, [findResults, cim.cimAdapter]);

    const wrappedResources = wrapped?.[0] ?? [];
    const foundGroups = wrapped?.[1] ?? [];*/

    return <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle id="customized-dialog-title">
            {t("title")}
        </DialogTitle>
        <DialogContent dividers>
            <Box display={"flex"}>
                <TextField id="standard-basic" placeholder={t("placeholder")} fullWidth autoFocus onChange={onChange}
                           error={isError}/>
                {loading && <CircularProgress style={{marginLeft: "1rem"}} size={30}/>}
                {/*<SelectGlossaryButton style={{marginLeft: "1rem"}} foundGroups={foundGroups} />*/}
            </Box>
            <List className={classes.root} dense component="nav" aria-label="secondary mailbox folders">
                {/*{wrappedResources.filter(r => !filteredOutGroups.some(fo => r.group.some(g => g.startsWith(fo)))).map(({resource: result}) =>*/}
                {findResults.map((result: PimClass) =>
                    <ListItem button key={result.pimInterpretation} onClick={() => {
                        selected(result);
                        close();
                    }}>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap
                                                             title={result.pimHumanDescription?.cs}>{result.pimHumanDescription?.cs}</Typography>}>
                            <strong>{result.pimHumanLabel?.cs}</strong>
                            {" "}
                            <SlovnikGovCzGlossary cimResourceIri={result.pimInterpretation as string} />
                        </ListItemText>
                    </ListItem>
                )}
            </List>
        </DialogContent>
    </Dialog>;
};

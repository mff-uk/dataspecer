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
    Typography
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {IdProvider, PimClass, Slovnik, SlovnikPimMetadata} from 'model-driven-data';
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {GlossaryNote} from "../slovnik.gov.cz/GlossaryNote";


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
    const classes = useStyles();
    const [findResults, updateFindResults] = useState<PimClass[]>([]);
    const [subject, setSubject] = useState<BehaviorSubject<string> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const subject = new BehaviorSubject('');
        setSubject(subject);
        subject.pipe(
            debounceTime(200)
        ).subscribe( term => {
            if (term) {
                const idProvider = new IdProvider();
                const adapter = new Slovnik(idProvider);
                setLoading(true);
                adapter.search(term).then(result => {
                    updateFindResults(result);
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
        if(subject) {
            return subject.next(e.target.value);
        }
    };

    return <Dialog onClose={close} aria-labelledby="customized-dialog-title" open={isOpen} fullWidth maxWidth={"md"}>
        <DialogTitle id="customized-dialog-title">
            Add root class
        </DialogTitle>
        <DialogContent dividers>
            <Box display={"flex"}>
                <TextField id="standard-basic" placeholder="type IRI or search for label" fullWidth autoFocus onChange={onChange} />
                {loading && <CircularProgress style={{marginLeft: "1rem"}} size={30} />}
            </Box>
            <List className={classes.root} dense component="nav" aria-label="secondary mailbox folders">
                {findResults.map((result: PimClass & SlovnikPimMetadata)  =>
                    <ListItem button key={result.id} onClick={() => {selected(result); close();}}>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap title={result.pimHumanDescription?.cs}>{result.pimHumanDescription?.cs}</Typography>}>
                            <strong>{result.pimHumanLabel?.cs}</strong>
                            {" "}
                            <GlossaryNote entity={result as SlovnikPimMetadata} />
                        </ListItemText>
                    </ListItem>
                )}
            </List>
        </DialogContent>
    </Dialog>;
}
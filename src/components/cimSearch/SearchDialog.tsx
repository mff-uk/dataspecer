import {Dialog, DialogContent, DialogTitle, List, ListItem, ListItemText, TextField} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {IdProvider, PimClass, Slovnik} from 'model-driven-data';
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";


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

    useEffect(() => {findResults.length && isOpen && updateFindResults([])}, [isOpen]);

    useEffect(() => {
        if(subject === null) {
            const sub = new BehaviorSubject('');
            setSubject(sub);
        } else {
            subject.pipe(
                debounceTime(200)
            ).subscribe( term => {
                if (term) {
                    const idProvider = new IdProvider();
                    const adapter = new Slovnik(idProvider);
                    adapter.search(term).then(updateFindResults);
                } else {
                    updateFindResults([]);
                }
            });

            // When the component unmounts, this will clean up the
            // subscription
            return () => subject.unsubscribe();
        }
    }, [subject]);

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
            <TextField id="standard-basic" placeholder="type IRI or search for label" fullWidth autoFocus onChange={onChange} />
            <List className={classes.root} dense component="nav" aria-label="secondary mailbox folders">
                {findResults.map(result =>
                    <ListItem button key={result.id} onClick={() => {selected(result); close();}}>
                        <ListItemText secondary={result.pimHumanDescription?.cs}>{result.pimHumanLabel?.cs}</ListItemText>
                    </ListItem>
                )}
            </List>
        </DialogContent>
    </Dialog>;
}
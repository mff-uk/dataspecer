import React, {useCallback, useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField} from "@mui/material";
import {useToggle} from "../../use-toggle";
import axios from "axios";

export const CreateDataPsm: React.FC<{ reload: (() => void) | undefined, specificationId: string }>
    = ({
           reload,
           specificationId
       }) => {
    const dialog = useToggle();
    const [name, setName] = useState<string>("");

    const create = useCallback(async () => {
        await axios.post(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}/data-psm`, {name});
        reload?.();
        dialog.close();
        setName("");
    }, [reload, dialog, name, specificationId]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <AddIcon sx={{mr: 1}}/>
            Create new
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Create new data structure</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            create().then();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={create} fullWidth variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    </>
}

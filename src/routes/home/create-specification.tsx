import React, {useCallback, useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField} from "@mui/material";
import {useToggle} from "../../use-toggle";
import axios from "axios";

export const CreateSpecification: React.FC<{ reload: (() => void) | undefined }> = ({reload}) => {
    const dialog = useToggle();
    const [name, setName] = useState<string>("");

    const create = useCallback(async () => {
        await axios.post(`${process.env.REACT_APP_BACKEND}/specification`, {name});
        reload?.();
        dialog.close();
    }, [reload, dialog, name]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <AddIcon sx={{mr: 1}}/>
            Create new specification
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Create new specification</DialogTitle>
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
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={create} fullWidth variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    </>
}

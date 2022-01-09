import React, {useCallback, useEffect, useState} from "react";
import {Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {useToggle} from "../../use-toggle";
import axios from "axios";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import PowerIcon from '@mui/icons-material/Power';
import {DataSpecification} from "../../interfaces/data-specification";
import {processEnv} from "../../index";

export const ReuseDataSpecifications: React.FC<{ reload: (() => void) | undefined, specificationId: string }>
    = ({
           reload,
           specificationId
       }) => {
    const dialog = useToggle();

    const [specifications] = useAsyncMemoWithTrigger(() => axios.get<DataSpecification[]>(`${processEnv.REACT_APP_BACKEND}/specification`), []);

    const [specification] = useAsyncMemoWithTrigger(() => axios.get<DataSpecification>(`${processEnv.REACT_APP_BACKEND}/specification/${specificationId}`), []);

    const [selectedSpecificationIds, setSelectedSpecificationIds] = useState<string[]>([]);
    const handleToggle = (value: string) => () => {
        const currentIndex = selectedSpecificationIds.indexOf(value);
        const newChecked = [...selectedSpecificationIds];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedSpecificationIds(newChecked);
    };

    useEffect(() => {
        if (specification) {
            setSelectedSpecificationIds(specification.data.reusesDataSpecification.map(linked => linked.id));
        }
    }, [specification]);

    const save = useCallback(async () => {
        await axios.put(`${processEnv.REACT_APP_BACKEND}/specification/${specificationId}`, {
            linkedSpecifications: selectedSpecificationIds
        });
        reload?.();
        dialog.close();
    }, [reload, dialog, specificationId, selectedSpecificationIds]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <PowerIcon sx={{mr: 1}}/>
            Set reused data specifications
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Reuse data specifications</DialogTitle>
            <DialogContent>
                <List>
                    {specification && specifications?.data?.filter(spec => spec.id !== specificationId).map(spec => {
                        return (
                            <ListItem key={spec.id} disablePadding>
                                <ListItemButton role={undefined} onClick={handleToggle(spec.id)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedSpecificationIds.indexOf(spec.id) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={spec.name}/>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={save} fullWidth variant="contained">Reuse selected data specifications</Button>
            </DialogActions>
        </Dialog>
    </>
}

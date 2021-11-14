import React, {useCallback, useEffect, useState} from "react";
import {Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {useToggle} from "../../use-toggle";
import axios from "axios";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import PowerIcon from '@mui/icons-material/Power';

export const LinkSpecification: React.FC<{ reload: (() => void) | undefined, specificationId: string }>
    = ({
           reload,
           specificationId
       }) => {
    const dialog = useToggle();
    const [name, setName] = useState<string>("");

    const [specifications, isLoading, reloadSpecifications]
        = useAsyncMemoWithTrigger(() => axios.get(`${process.env.REACT_APP_BACKEND}/specification`), []);

    const [specification, isLoading2, reloadSpecification] = useAsyncMemoWithTrigger(() => axios.get(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}`), []);

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
            setSelectedSpecificationIds(specification.data.linkedSpecification.map((linked: any) => linked.id));
        }
    }, [specification]);

    const save = useCallback(async () => {
        await axios.put(`${process.env.REACT_APP_BACKEND}/specification/${specificationId}`, {
            linkedSpecifications: selectedSpecificationIds
        });
        reload?.();
        dialog.close();
    }, [reload, dialog, name, specificationId]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <PowerIcon sx={{mr: 1}}/>
            Set linked specifications
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Create new data PSM</DialogTitle>
            <DialogContent>
                <List>
                    {specification && specifications?.data?.filter((spec: any) => spec.id !== specificationId).map((spec: any) => {
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
                <Button onClick={save} fullWidth variant="contained">Link</Button>
            </DialogActions>
        </Dialog>
    </>
}

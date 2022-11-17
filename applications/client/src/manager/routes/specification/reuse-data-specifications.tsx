import React, {useCallback, useContext, useEffect, useState} from "react";
import {Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, List, ListItem, ListItemButton, ListItemIcon, Skeleton} from "@mui/material";
import {useToggle} from "../../use-toggle";
import PowerIcon from '@mui/icons-material/Power';
import {DataSpecificationsContext} from "../../app";
import {DataSpecificationName} from "../../name-cells";
import {BackendConnectorContext} from "../../../application";

export const ReuseDataSpecifications: React.FC<{
    dataSpecificationIri: string,
}>
    = ({dataSpecificationIri}) => {
    const dialog = useToggle();

    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[dataSpecificationIri];
    const backendConnector = useContext(BackendConnectorContext);

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
        if (specification?.importsDataSpecifications) {
            setSelectedSpecificationIds(specification?.importsDataSpecifications);
        }
    }, [specification?.importsDataSpecifications]);

    const save = useCallback(async () => {
        const newSpecification = await backendConnector.updateDataSpecification(
            dataSpecificationIri,
            {
                importsDataSpecifications: selectedSpecificationIds,
            }
        );
        setDataSpecifications({
            ...dataSpecifications,
            [dataSpecificationIri]: newSpecification,
        });

        dialog.close();
    }, [backendConnector, dataSpecificationIri, dataSpecifications, selectedSpecificationIds, setDataSpecifications, dialog]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <PowerIcon sx={{mr: 1}}/>
            Set reused data specifications
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Reuse data specifications</DialogTitle>
            <DialogContent>
                <List>
                    {specification && Object.values(dataSpecifications).map(spec => {
                        return (
                            <ListItem key={spec.iri} disablePadding>
                                <ListItemButton role={undefined} onClick={handleToggle(spec.iri as string)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedSpecificationIds.indexOf(spec.iri as string) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <DataSpecificationName iri={spec.iri as string}>
                                        {(label, isLoading) =>
                                            <>{isLoading ? <Skeleton /> : (label ? label : <small>{spec.iri}</small>)}</>
                                        }
                                    </DataSpecificationName>
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

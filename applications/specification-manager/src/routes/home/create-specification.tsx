import React, {useCallback, useContext, useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {SetPimLabelAndDescription} from "../../shared/set-pim-label-and-description";
import {Resource} from "@model-driven-data/federated-observable-store/resource";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";

export const CreateSpecification: React.FC<{ reload: (() => void) | undefined }> = ({reload}) => {
    const dialog = useToggle();
    const [name, setName] = useState<string>("");

    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const store = useFederatedObservableStore();
    const create = useCallback(async () => {
        const dataSpecification = await backendConnector.createDataSpecification();
        const pim = dataSpecification.pim as string;

        // Wait for store to be initialized
        await new Promise<void>(resolve => {
            const subscriber = (iri: string, resource: Resource) => {
                if (resource.resource) {
                    store.removeSubscriber(pim, subscriber);
                    resolve();
                }
            }
            store.addSubscriber(pim, subscriber);

            setDataSpecifications({
                ...dataSpecifications,
                [dataSpecification.iri as string]: dataSpecification
            });
            setRootDataSpecificationIris([...rootDataSpecificationIris, dataSpecification.iri as string]);
        });

        const op = new SetPimLabelAndDescription(pim, {en: name}, {});
        await store.executeComplexOperation(op);
        dialog.close();
        setName("");
    }, [backendConnector, name, store, dialog, setDataSpecifications, dataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <AddIcon sx={{mr: 1}}/>
            Create new
        </Fab>
        <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
            <DialogTitle>Create new data specification</DialogTitle>
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

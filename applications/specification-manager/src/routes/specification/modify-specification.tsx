import React, {useCallback, useContext, useMemo} from "react";
import EditIcon from "@mui/icons-material/Edit";
import {Fab} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {SetPimLabelAndDescription} from "../../shared/set-pim-label-and-description";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {SpecificationEditDialog, SpecificationEditDialogEditableProperties} from "../../components/specification-edit-dialog";
import {PimSchema} from "@dataspecer/core/pim/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

export const ModifySpecification: React.FC<{ iri: string }> = ({iri}) => {
    const dialog = useToggle();

    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[iri as string];
    const store = useFederatedObservableStore();
    const {resource: pimSchema} = useResource<PimSchema>(specification?.pim);
    const backendConnector = useContext(BackendConnectorContext);


    const editableProperties = useMemo(() => ({
        label: pimSchema?.pimHumanLabel ?? {},
        tags: specification?.tags ?? [],
    }), [pimSchema, specification?.tags]);
    
    const modify = useCallback(async ({label, tags}: Partial<SpecificationEditDialogEditableProperties>) => {
        const pim = specification.pim as string;
        
        if (label) {
            const op = new SetPimLabelAndDescription(pim, label, {});
            await store.executeComplexOperation(op);
        }

        if (tags) {
            const newSpecification = await backendConnector.updateDataSpecification(
                iri, {tags});
            setDataSpecifications({
                ...dataSpecifications,
                [iri]: newSpecification,
            });
        }
        dialog.close();
    }, [specification?.pim, dialog, store, backendConnector, iri, setDataSpecifications, dataSpecifications]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <EditIcon sx={{mr: 1}}/>
            Modify
        </Fab>
        <SpecificationEditDialog
            isOpen={dialog.isOpen}
            close={dialog.close}
            mode="modify"
            properties={editableProperties}
            onSubmit={modify}
        />
    </>
}

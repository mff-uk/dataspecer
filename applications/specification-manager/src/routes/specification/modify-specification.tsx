import React, {useCallback, useContext, useMemo} from "react";
import EditIcon from "@mui/icons-material/Edit";
import {Fab} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {DataSpecificationsContext} from "../../app";
import {SetPimLabelAndDescription} from "../../shared/set-pim-label-and-description";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";
import {SpecificationEditDialog} from "../../components/specification-edit-dialog";
import {LanguageString} from "@model-driven-data/core/core";
import {PimSchema} from "@model-driven-data/core/pim/model";
import {useResource} from "@model-driven-data/federated-observable-store-react/use-resource";

export const ModifySpecification: React.FC<{ iri: string }> = ({iri}) => {
    const dialog = useToggle();

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[iri as string];
    const store = useFederatedObservableStore();
    const {resource: pimSchema} = useResource<PimSchema>(specification?.pim);

    const editableProperties = useMemo(() => ({
        label: pimSchema?.pimHumanLabel ?? {},
    }), [pimSchema]);
    
    const modify = useCallback(async ({label}: {label?: LanguageString}) => {
        const pim = specification.pim as string;
        
        if (label) {
            const op = new SetPimLabelAndDescription(pim, label, {});
            await store.executeComplexOperation(op);
        }
        dialog.close();
    }, [specification?.pim, dialog, store]);

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

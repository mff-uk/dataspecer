import EditIcon from "@mui/icons-material/Edit";
import { Fab } from "@mui/material";
import React, { useCallback, useContext, useMemo } from "react";
import { BackendConnectorContext } from "../../../application";
import { DataSpecificationsContext } from "../../app";
import { SpecificationEditDialog, SpecificationEditDialogEditableProperties } from "../../components/specification-edit-dialog";
import { useToggle } from "../../use-toggle";

export const ModifySpecification: React.FC<{ iri: string }> = ({iri}) => {
    const dialog = useToggle();

    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[iri as string];
    const backendConnector = useContext(BackendConnectorContext);


    const editableProperties = useMemo(() => ({
        label: specification?.label ?? {},
        tags: specification?.tags ?? [],
    }), [specification?.label, specification?.tags]);

    const modify = useCallback(async ({label, tags}: Partial<SpecificationEditDialogEditableProperties>) => {
        const changes = {};

        if (label) {
            changes["label"] = label;
        }

        if (tags) {
            changes["tags"] = tags;
        }

        const newSpecification = await backendConnector.updateSpecificationMetadata(iri, changes);
        setDataSpecifications({
            ...dataSpecifications,
            [iri]: newSpecification,
        });
        dialog.close();
    }, [dialog, backendConnector, iri, setDataSpecifications, dataSpecifications]);

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

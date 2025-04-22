import EditIcon from "@mui/icons-material/Edit";
import { Fab } from "@mui/material";
import React, { useCallback, useContext, useMemo } from "react";
import { BackendConnectorContext } from "../../../application";
import { SpecificationEditDialog, SpecificationEditDialogEditableProperties } from "../../components/specification-edit-dialog";
import { useToggle } from "../../use-toggle";
import { SpecificationContext } from "./specification";

export const ModifySpecification: React.FC = () => {
  const dialog = useToggle();

  const [specification, updateSpecification] = useContext(SpecificationContext);
  const backendConnector = useContext(BackendConnectorContext);

  const editableProperties = useMemo(
    () => ({
      label: specification?.label ?? {},
      tags: specification?.tags ?? [],
    }),
    [specification?.label, specification?.tags]
  );

  const modify = useCallback(
    async ({ label, tags }: Partial<SpecificationEditDialogEditableProperties>) => {
      const changes = {};

      if (label) {
        changes["label"] = label;
      }

      if (tags) {
        changes["tags"] = tags;
      }

      const newSpecification = await backendConnector.updateSpecificationMetadata(specification.id, changes);
      updateSpecification(newSpecification);
      dialog.close();
    },
    [dialog, backendConnector, specification, updateSpecification]
  );

  return (
    <>
      <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
        <EditIcon sx={{ mr: 1 }} />
        Modify
      </Fab>
      <SpecificationEditDialog isOpen={dialog.isOpen} close={dialog.close} mode="modify" properties={editableProperties} onSubmit={modify} />
    </>
  );
};

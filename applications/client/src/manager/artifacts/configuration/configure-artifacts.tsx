import React, {FC, useCallback, useContext} from "react";
import {DataSpecificationsContext} from "../../app";
import {ConfigureArtifactsDialog} from "./configure-artifacts-dialog";
import {Button} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {BackendConnectorContext} from "../../../application";

/**
 * Renders button and adds logic for updating the configuration.
 * @constructor
 */
export const ConfigureArtifacts: FC<{
  dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
  const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
  const backendConnector = useContext(BackendConnectorContext);
  const specification = dataSpecifications[dataSpecificationIri];

  const configuration = specification?.artefactConfiguration ?? {};

  const update = useCallback(async (configuration: object) => {
    const result = await backendConnector.updateDataSpecification(dataSpecificationIri, {artefactConfiguration: configuration});
    setDataSpecifications({...dataSpecifications, [dataSpecificationIri]: result});
  }, [backendConnector, dataSpecificationIri, dataSpecifications, setDataSpecifications]);

  const configureArtifactsDialogOpen = useToggle(false);

  return <>
    <Button
      onClick={configureArtifactsDialogOpen.open}>
      Configure artifacts
    </Button>

    <ConfigureArtifactsDialog
      isOpen={configureArtifactsDialogOpen.isOpen}
      close={configureArtifactsDialogOpen.close}
      onChange={update}
      configuration={configuration}
    />
  </>
}

import React, {FC, useCallback, useContext, useMemo} from "react";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {ConfigureArtifactsDialog} from "./configure-artifacts-dialog";
import {Button} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {DefaultArtifactConfiguratorConfiguration} from "@dataspecer/core/data-specification/default-artifact-configurator-configuration";
import {DataSpecificationArtefactBuilderConfiguration} from "@dataspecer/core/data-specification/model/data-specification-artefact-builder-configuration";

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

  const configuration = useMemo(() => {
    // Todo: We expect no other configuration types exists
    return (specification?.artefactConfiguration[0] as DefaultArtifactConfiguratorConfiguration) ??
      new DefaultArtifactConfiguratorConfiguration();
  }, [specification]);

  const update = useCallback(async (configuration: DataSpecificationArtefactBuilderConfiguration) => {
    const result = await backendConnector.updateDataSpecification(dataSpecificationIri, {artefactConfiguration: [configuration]});
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

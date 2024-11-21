import { Button } from "@mui/material";
import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../../application";
import { useAsyncMemo } from "../../../editor/hooks/use-async-memo";
import { useToggle } from "../../use-toggle";
import { ConfigureArtifactsDialog } from "./configure-artifacts-dialog";

/**
 * Renders button and adds logic for updating the configuration.
 * @constructor
 */
export const ConfigureArtifacts: FC<{
  dataSpecificationId: string,
  configurationId: string,
}> = ({configurationId}) => {
  const {t} = useTranslation("ui");
  const backendConnector = useContext(BackendConnectorContext);

  const [configuration] = useAsyncMemo(() => backendConnector.getArtifactConfiguration(configurationId), [backendConnector, configurationId], {});

  const update = useCallback(async (configuration: object) => {
    await backendConnector.updateArtifactConfiguration(configurationId, configuration);
  }, [backendConnector, configurationId]);

  const configureArtifactsDialogOpen = useToggle(false);

  return <>
    <Button
      onClick={configureArtifactsDialogOpen.open}>
      {t("configure artifacts")}
    </Button>

    <ConfigureArtifactsDialog
      isOpen={configureArtifactsDialogOpen.isOpen}
      close={configureArtifactsDialogOpen.close}
      onChange={update}
      configuration={configuration}
    />
  </>
}

import SettingsIcon from "@mui/icons-material/Settings";
import { Fab } from "@mui/material";
import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../../application";
import { SpecificationContext } from "../../routes/specification/specification";
import { useToggle } from "../../use-toggle";
import { ConfigureDialog } from "./configure-dialog";

/**
 * Renders button and adds logic for updating the configuration.
 * @constructor
 */
export const ConfigureButton: FC = () => {
  const { t } = useTranslation("ui");
  const [specification, updateSpecification] = useContext(SpecificationContext);
  const backendConnector = useContext(BackendConnectorContext);

  const configuration = specification?.userPreferences ?? {};

  const update = useCallback(
    async (configuration: object) => {
      const result = await backendConnector.updateUserPreferences(specification.iri, configuration);
      updateSpecification(result);
    },
    [backendConnector, specification, updateSpecification]
  );

  const ConfigureDialogOpen = useToggle(false);

  return (
    <>
      <Fab variant="extended" size="medium" color={"primary"} onClick={ConfigureDialogOpen.open}>
        <SettingsIcon sx={{ mr: 1 }} />
        {t("configure")}
      </Fab>

      <ConfigureDialog isOpen={ConfigureDialogOpen.isOpen} close={ConfigureDialogOpen.close} onChange={update} configuration={configuration} />
    </>
  );
};

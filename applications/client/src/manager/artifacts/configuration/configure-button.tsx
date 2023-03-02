import SettingsIcon from '@mui/icons-material/Settings';
import { Fab } from "@mui/material";
import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../../application";
import { DataSpecificationsContext } from "../../app";
import { useToggle } from "../../use-toggle";
import { ConfigureDialog } from "./configure-dialog";

/**
 * Renders button and adds logic for updating the configuration.
 * @constructor
 */
export const ConfigureButton: FC<{
  dataSpecificationIri: string,
}> = ({dataSpecificationIri}) => {
  const {t} = useTranslation("ui");
  const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
  const backendConnector = useContext(BackendConnectorContext);
  const specification = dataSpecifications[dataSpecificationIri];

  const configuration = specification?.artefactConfiguration ?? {};

  const update = useCallback(async (configuration: object) => {
    const result = await backendConnector.updateDataSpecification(dataSpecificationIri, {artefactConfiguration: configuration});
    setDataSpecifications({...dataSpecifications, [dataSpecificationIri]: result});
  }, [backendConnector, dataSpecificationIri, dataSpecifications, setDataSpecifications]);

  const ConfigureDialogOpen = useToggle(false);

  return <>
    <Fab variant="extended" size="medium" color={"primary"} onClick={ConfigureDialogOpen.open}>
      <SettingsIcon sx={{mr: 1}}/>
      {t("configure")}
    </Fab>

    <ConfigureDialog
      isOpen={ConfigureDialogOpen.isOpen}
      close={ConfigureDialogOpen.close}
      onChange={update}
      configuration={configuration}
    />
  </>
}

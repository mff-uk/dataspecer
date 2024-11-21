import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {clone} from "lodash";
import {FC, useContext, useEffect, useState} from "react";
import {DefaultConfigurationContext} from "../../../application";
import {ConfigureArtifactsConfiguration} from "./configure-artifacts-configuration";

/**
 * Dialog that edits configuration.
 */
export const ConfigureArtifactsDialog: FC<{
  isOpen: boolean,
  close: () => void,
  onChange: (configuration: object) => void,
  configuration: object,
}> = ({isOpen, close, onChange, configuration}) => {
  const defaultConfiguration = useContext(DefaultConfigurationContext);
  const [localConfiguration, setLocalConfiguration] = useState(() => clone(configuration));
  useEffect(() => {
    if (isOpen) {
      setLocalConfiguration(clone(configuration))
    }
  }, [isOpen, configuration]);

  return <Dialog
    open={isOpen}
    onClose={close}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>
      Configure artifacts
    </DialogTitle>
    <DialogContent>
      <ConfigureArtifactsConfiguration
          defaultConfiguration={defaultConfiguration}
          configuration={localConfiguration}
          onConfigurationChange={setLocalConfiguration}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Discard</Button>
      <Button onClick={() => {
        onChange(localConfiguration);
        close();
      }}>Save</Button>
    </DialogActions>
  </Dialog>;
}

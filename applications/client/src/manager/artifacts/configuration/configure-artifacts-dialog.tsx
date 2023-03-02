import { BikeshedConfiguration, BikeshedConfigurator } from "@dataspecer/bikeshed";
import { CsvConfiguration, CsvConfigurator } from "@dataspecer/csv/configuration";
import { JsonConfiguration, JsonConfigurator } from "@dataspecer/json/configuration";
import { XmlConfiguration, XmlConfigurator } from "@dataspecer/xml/configuration";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import { clone } from "lodash";
import { FC, useContext, useEffect, useState } from "react";
import { DefaultConfigurationContext } from "../../../application";
import { Bikeshed } from "./tabs/bikeshed";
import { Csv } from "./tabs/csv";
import { Json } from "./tabs/json";
import { Xml } from "./tabs/xml";

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

  const [currentTab, setCurrentTab] = useState(0);

  return <Dialog
    open={isOpen}
    onClose={close}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>
      Configure artifacts
    </DialogTitle>
    <DialogContent>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, i) => setCurrentTab(i)}>
          <Tab label="JSON" />
          <Tab label="CSV" />
          <Tab label="XSD" />
          <Tab label="Bikeshed" />
        </Tabs>
      </Box>
      {currentTab === 0 &&
        <Json
            input={JsonConfigurator.getFromObject(localConfiguration)}
            onChange={u => setLocalConfiguration(JsonConfigurator.setToObject(localConfiguration, u))}
            defaultObject={JsonConfigurator.getFromObject(defaultConfiguration) as JsonConfiguration}
        />
      }
      {currentTab === 1 &&
        <Csv
            input={CsvConfigurator.getFromObject(localConfiguration)}
            onChange={u => setLocalConfiguration(CsvConfigurator.setToObject(localConfiguration, u))}
            defaultObject={CsvConfigurator.getFromObject(defaultConfiguration) as CsvConfiguration}
        />
      }
      {currentTab === 2 &&
        <Xml
            input={XmlConfigurator.getFromObject(localConfiguration)}
            onChange={u => setLocalConfiguration(XmlConfigurator.setToObject(localConfiguration, u))}
            defaultObject={XmlConfigurator.getFromObject(defaultConfiguration) as XmlConfiguration}
        />
      }
      {currentTab === 3 &&
        <Bikeshed
            input={BikeshedConfigurator.getFromObject(localConfiguration)}
            onChange={u => setLocalConfiguration(BikeshedConfigurator.setToObject(localConfiguration, u))}
            defaultObject={BikeshedConfigurator.getFromObject(defaultConfiguration) as BikeshedConfiguration}
        />
      }

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

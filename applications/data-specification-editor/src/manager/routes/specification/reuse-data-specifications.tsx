import PowerIcon from "@mui/icons-material/Power";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, List, ListItem, ListItemButton, ListItemIcon } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { BackendConnectorContext } from "../../../application";
import { LanguageStringText } from "../../../editor/components/helper/LanguageStringComponents";
import { useToggle } from "../../use-toggle";
import { AllSpecificationsContext, SpecificationContext } from "./specification";

export const ReuseDataSpecifications: React.FC = () => {
  const dialog = useToggle();

  const [specification, updateSpecification] = useContext(SpecificationContext);
  const backendPackageService = useContext(BackendConnectorContext);

  const allSpecifications = useContext(AllSpecificationsContext);

  const [selectedSpecificationIds, setSelectedSpecificationIds] = useState<string[]>([]);

  const handleToggle = (value: string) => () => {
    const currentIndex = selectedSpecificationIds.indexOf(value);
    const newChecked = [...selectedSpecificationIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedSpecificationIds(newChecked);
  };

  useEffect(() => {
    if (specification?.importsDataSpecificationIds) {
      setSelectedSpecificationIds(specification?.importsDataSpecificationIds);
    }
  }, [specification?.importsDataSpecificationIds]);

  const save = async () => {
    await backendPackageService.updateImportedDataSpecifications(specification.id, selectedSpecificationIds);
    updateSpecification({
      ...specification,
      importsDataSpecificationIds: selectedSpecificationIds,
    });

    dialog.close();
  };

  return (
    <>
      <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
        <PowerIcon sx={{ mr: 1 }} />
        Set reused data specifications
      </Fab>
      <Dialog open={dialog.isOpen} onClose={dialog.close} maxWidth={"xs"} fullWidth>
        <DialogTitle>Reuse data specifications</DialogTitle>
        <DialogContent>
          <List>
            {Object.entries(allSpecifications).map(([_, spec]) => (
              <ListItem key={spec.iri} disablePadding>
                <ListItemButton role={undefined} onClick={handleToggle(spec.iri as string)} dense>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={selectedSpecificationIds.includes(spec.iri as string)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <LanguageStringText from={spec.userMetadata.label} fallback={spec.iri} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={save} fullWidth variant="contained">
            Reuse selected data specifications
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

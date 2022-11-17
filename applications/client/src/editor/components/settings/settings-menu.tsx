import React, {FC, useContext, useRef} from "react";
import {useTranslation} from "react-i18next";
import {useToggle} from "../../hooks/use-toggle";
import {Button, ListItemText, Menu, MenuItem, Switch} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import {SettingsContext} from "./settings";

export const SettingsMenu: FC = () => {
  const {t} = useTranslation(["_"]);
  // Main button reference
  const ref = useRef(null);
  const {isOpen, open, close} = useToggle();

  const settingsContext = useContext(SettingsContext);

  return <>
    <Button
      startIcon={<SettingsTwoToneIcon color="inherit" />}
      endIcon={<ExpandMoreIcon color="inherit" />}
      onClick={open}
      color="inherit"
      ref={ref}
    >
      {t("options")}
    </Button>
    <Menu
      anchorEl={ref.current}
      keepMounted
      open={isOpen}
      onClose={close}
    >
      <MenuItem onClick={() => {
        settingsContext.setUseInheritanceUiInsteadOfOr(!settingsContext.useInheritanceUiInsteadOfOr);
        close();
      }}>
        <ListItemText>{t("use inheritance ui instead of or")}</ListItemText>
        <Switch
          checked={settingsContext.useInheritanceUiInsteadOfOr}
          onChange={() => {
            settingsContext.setUseInheritanceUiInsteadOfOr(!settingsContext.useInheritanceUiInsteadOfOr);
            close();
          }}
        />
      </MenuItem>
    </Menu>
  </>;
}

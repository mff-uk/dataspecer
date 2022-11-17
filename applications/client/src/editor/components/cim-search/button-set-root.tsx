import React, {useCallback, useContext, useRef} from "react";
import {Button, ButtonGroup, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {SearchDialog} from "./search-dialog";
import {useToggle} from "../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {ConfigurationContext} from "../App";
import {PimClass} from "@dataspecer/core/pim/model";
import {CreateRootClass} from "../../operations/create-root-class";
import {selectLanguage} from "../../utils/select-language";
import {languages} from "../../../i18n";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import SearchIcon from '@mui/icons-material/Search';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AutorenewIcon from '@mui/icons-material/Autorenew'; // ref
import CodeIcon from '@mui/icons-material/Code';
import {CreateRootOr} from "../../operations/create-root-or";

function formatString(input: string, args: {[key: string]: string}): string {
    return input.replace(/{([^}]+)}/g, (match, key) => args[key]);
}

const ButtonSetRoot: React.FC = () => {
  const {dataPsmSchemaIri, dataSpecificationIri, dataSpecifications, operationContext} = useContext(ConfigurationContext);
  const store = useFederatedObservableStore();
  const {isOpen, open, close} = useToggle();
  const {t, i18n} = useTranslation("ui");
  // t('new schema description format')
  // t('new schema label format')

  const buttonRef = useRef(null);
  const menuOpen = useToggle(false);

  const setRootClass = useCallback(async (cls: PimClass) => {
    const newSchemaLabel = Object.fromEntries(
      languages.map(
        lang => [
          lang,
          formatString(
            i18n.getFixedT([lang], "ui")('new schema label format'),
            {
              label: selectLanguage(cls.pimHumanLabel ?? {}, [lang]) ?? "",
              description: selectLanguage(cls.pimHumanDescription ?? {}, [lang]) ?? "",
            }
          )
        ]
      )
    );

    const newSchemaDescription = Object.fromEntries(
      languages.map(
        lang => [
          lang,
          formatString(
            i18n.getFixedT([lang], "ui")('new schema description format'),
            {
              label: selectLanguage(cls.pimHumanLabel ?? {}, [lang]) ?? "",
              description: selectLanguage(cls.pimHumanDescription ?? {}, [lang]) ?? "",
            }
          )
        ]
      )
    );

    if (dataSpecificationIri && dataPsmSchemaIri && dataSpecifications[dataSpecificationIri].pim) {
      const op = new CreateRootClass(cls, dataSpecifications[dataSpecificationIri].pim as string, dataPsmSchemaIri, newSchemaLabel, newSchemaDescription);
      op.setContext(operationContext);
      store.executeComplexOperation(op).then();
    }
  }, [dataSpecificationIri, dataPsmSchemaIri, dataSpecifications, i18n, operationContext, store]);

  const setRootOr = useCallback(() => {
    if (dataSpecificationIri && dataPsmSchemaIri) {
      store.executeComplexOperation(new CreateRootOr(dataSpecifications[dataSpecificationIri].pim as string, dataPsmSchemaIri));
      menuOpen.close();
    }
  }, [dataSpecificationIri, dataPsmSchemaIri, store, dataSpecifications, menuOpen]);

  return <>
    <ButtonGroup variant="contained" ref={buttonRef}>
      <Button variant="contained" onClick={open}>
          <AccountTreeTwoToneIcon style={{marginRight: ".25em"}}/>
          {t("set root element button")}
      </Button>
      <Button size="small" onClick={menuOpen.open}>
        <ArrowDropDownIcon />
      </Button>
    </ButtonGroup>

    <Menu anchorEl={buttonRef.current} open={menuOpen.isOpen} onClose={menuOpen.close}>
      <MenuItem onClick={open}>
        <ListItemIcon>
          <SearchIcon fontSize="small" fontWeight="bold" />
        </ListItemIcon>
        <ListItemText><strong>{t("set root.search for class")}</strong></ListItemText>
      </MenuItem>

      <MenuItem onClick={setRootOr}>
        <ListItemIcon>
          <CallSplitIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("set root.use or")}</ListItemText>
      </MenuItem>

      <MenuItem disabled>
        <ListItemIcon>
          <AutorenewIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("set root.use class reference")}</ListItemText>
      </MenuItem>

      <MenuItem disabled>
        <ListItemIcon>
          <CodeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("set root.use structured class")}</ListItemText>
      </MenuItem>
    </Menu>

    <SearchDialog isOpen={isOpen} close={close} selected={setRootClass}/>
  </>;
};

export default ButtonSetRoot;

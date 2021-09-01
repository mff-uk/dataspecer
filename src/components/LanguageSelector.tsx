import React, {useRef} from "react";
import {Button, Menu, MenuItem} from "@material-ui/core";
import TranslateIcon from "@material-ui/icons/Translate";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {useTranslation} from "react-i18next";
import {useToggle} from "../hooks/useToggle";
import {languages} from "../i18n";

export const LanguageSelector: React.FC = () => {
    const {t, i18n} = useTranslation(["_"]);
    const ref = useRef(null);
    const {isOpen, open, close} = useToggle();

    const setLanguage = (language: string) => {
        close();
        i18n.changeLanguage(language).then(null);
    };

    return <>
        <Button
            startIcon={<TranslateIcon color="inherit" />}
            endIcon={<ExpandMoreIcon color="inherit" />}
            onClick={open}
            color="inherit"
            ref={ref}
        >
            {t("locale")}
        </Button>
        <Menu
            anchorEl={ref.current}
            keepMounted
            open={isOpen}
            onClose={close}
        >
            {languages.map(language => <MenuItem onClick={() => setLanguage(language)} key={language}>{i18n.getFixedT(language, "_")("locale")}</MenuItem>)}
        </Menu>
    </>;
};

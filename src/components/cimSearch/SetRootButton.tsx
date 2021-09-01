import React from "react";
import {Fab} from "@material-ui/core";
import AccountTreeTwoToneIcon from '@material-ui/icons/AccountTreeTwoTone';
import {SearchDialog} from "./SearchDialog";
import {useToggle} from "../../hooks/useToggle";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";

const SetRootButton: React.FC = () => {
    const {setRootClass} = React.useContext(StoreContext);
    const {isOpen, open, close} = useToggle();
    const {t} = useTranslation("ui");

    return (
        <>
            <Fab variant="extended" size="medium" color="primary" onClick={open}>
                <AccountTreeTwoToneIcon style={{marginRight: ".25em"}}/>
                {t("set root element button")}
            </Fab>
            <SearchDialog isOpen={isOpen} close={close} selected={setRootClass}/>
        </>
    );
};

export default SetRootButton;

import React from "react";
import {Fab} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {SearchDialog} from "./SearchDialog";
import {PimClass} from "model-driven-data";
import {useToggle} from "../../hooks/useToggle";
import { useTranslation } from "react-i18next";

const AddRootButton: React.FC<{selected: (cls: PimClass) => void}> = ({selected}) => {
    const {isOpen, open, close} = useToggle();
    const {t} = useTranslation("ui");
    return (
        <>
            <Fab variant="extended" size="medium" color="primary" onClick={open}>
                <AddIcon />
                {t("add root element button")}
            </Fab>
            <SearchDialog isOpen={isOpen} close={close} selected={selected}/>
        </>
    );
};

export default AddRootButton;
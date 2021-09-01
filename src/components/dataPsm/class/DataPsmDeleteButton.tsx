import React from "react";
import {useTranslation} from "react-i18next";
import DeleteIcon from "@material-ui/icons/Delete";
import {ActionButton} from "../common/ActionButton";

export const DataPsmDeleteButton: React.FC<{onClick: () => void}> = ({onClick}) => {
    const {t} = useTranslation("psm");
    return <ActionButton onClick={onClick} icon={<DeleteIcon/>} label={t("button delete")} />;
};

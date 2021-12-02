import React from "react";
import {useTranslation} from "react-i18next";
import {Icons} from "../../../icons";
import {ActionButton} from "../common/ActionButton";

export const DataPsmDeleteButton: React.FC<{onClick: () => void}> = ({onClick}) => {
    const {t} = useTranslation("psm");
    return <ActionButton onClick={onClick} icon={<Icons.Tree.Delete/>} label={t("button delete")} />;
};

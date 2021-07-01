import React, {useCallback} from "react";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../../App";
import DeleteIcon from "@material-ui/icons/Delete";
import {PsmClass} from "model-driven-data";
import {ActionButton} from "../common/ActionButton";

export const DeleteButton: React.FC<{parent: PsmClass, index: number}> = ({parent, index}) => {
    const {t} = useTranslation("psm");
    const {psmRemoveFromPart} = React.useContext(StoreContext);
    const del = useCallback(() => psmRemoveFromPart(parent, index), [psmRemoveFromPart, parent, index]);
    return <ActionButton onClick={del} icon={<DeleteIcon/>} label={t("button delete")} />;
};

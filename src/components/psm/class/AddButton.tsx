import React from "react";
import {PsmClass} from "model-driven-data";
import AddIcon from "@material-ui/icons/Add";
import {AddInterpretedSurroundingDialog} from "../../addInterpretedSurroundings/AddInterpretedSurroundingDialog";
import {StoreContext} from "../../App";
import {useTranslation} from "react-i18next";
import {useToggle} from "../../../hooks/useToggle";
import {ActionButton} from "../common/ActionButton";

export const AddButton: React.FC<{forClass: PsmClass}> = ({forClass}) => {
    const {store, psmSelectedInterpretedSurroundings} = React.useContext(StoreContext);
    const {t} = useTranslation("psm");
    const surroundingDialog = useToggle();

    return <>
        <ActionButton onClick={surroundingDialog.open} icon={<AddIcon/>} label={t("button add")}/>
        <AddInterpretedSurroundingDialog store={store} isOpen={surroundingDialog.isOpen} close={surroundingDialog.close} selected={psmSelectedInterpretedSurroundings} psmClass={forClass} />
    </>;
};

import React from "react";
import AddIcon from "@material-ui/icons/Add";
import {AddInterpretedSurroundingDialog} from "../../addInterpretedSurroundings/AddInterpretedSurroundingDialog";
import {StoreContext} from "../../App";
import {useTranslation} from "react-i18next";
import {useToggle} from "../../../hooks/useToggle";
import {ActionButton} from "../common/ActionButton";

export const DataPsmClassAddSurroundingsButton: React.FC<{dataPsmClassIri: string}> = ({dataPsmClassIri}) => {
    const {addSurroundings} = React.useContext(StoreContext);
    const {t} = useTranslation("psm");
    const surroundingDialog = useToggle();

    return <>
        <ActionButton onClick={surroundingDialog.open} icon={<AddIcon/>} label={t("button add")}/>
        <AddInterpretedSurroundingDialog isOpen={surroundingDialog.isOpen} close={surroundingDialog.close} selected={addSurroundings} dataPsmClassIri={dataPsmClassIri} />
    </>;
};

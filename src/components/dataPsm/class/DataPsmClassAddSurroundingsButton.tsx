import React, {useCallback} from "react";
import AddIcon from "@mui/icons-material/Add";
import {AddInterpretedSurroundingDialog} from "../../addInterpretedSurroundings/AddInterpretedSurroundingDialog";
import {StoreContext} from "../../App";
import {useTranslation} from "react-i18next";
import {useToggle} from "../../../hooks/useToggle";
import {ActionButton} from "../common/ActionButton";
import {CoreResourceReader} from "model-driven-data/core";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {AddClassSurroundings} from "../../../operations/add-class-surroundings";

export const DataPsmClassAddSurroundingsButton: React.FC<{dataPsmClassIri: string}> = ({dataPsmClassIri}) => {
    const {store} = React.useContext(StoreContext);
    const {t, i18n} = useTranslation("psm");
    const surroundingDialog = useToggle();

    const addSurroundings = useCallback((operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: CoreResourceReader,
        forDataPsmClass: DataPsmClass,
        ciselnikIri: string,
     }) => {
        const addClassSurroundings = new AddClassSurroundings(operation.forDataPsmClass, operation.sourcePimModel, operation.resourcesToAdd, operation.ciselnikIri);
        addClassSurroundings.labelRules = {
            languages: i18n.languages as string[],
            namingConvention: "kebab-case",
            specialCharacters: "allow",
        };
        store.executeOperation(addClassSurroundings).then();
    }, [store]);

    return <>
        <ActionButton onClick={surroundingDialog.open} icon={<AddIcon/>} label={t("button add")}/>
        <AddInterpretedSurroundingDialog isOpen={surroundingDialog.isOpen} close={surroundingDialog.close} selected={addSurroundings} dataPsmClassIri={dataPsmClassIri} />
    </>;
};

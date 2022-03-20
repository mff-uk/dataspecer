import React, {useCallback, useContext} from "react";
import AddIcon from "@mui/icons-material/Add";
import {useTranslation} from "react-i18next";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {AddClassSurroundings} from "../../../operations/add-class-surroundings";
import {MenuItem} from "@mui/material";
import {AddInterpretedSurroundingsDialog} from "../../add-interpreted-surroundings";
import {UseDialogOpenFunction} from "../../../dialog";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";

export const DataPsmClassAddSurroundingsButton: React.FC<{open: UseDialogOpenFunction<typeof AddInterpretedSurroundingsDialog, "dataPsmClassIri">}> = ({open}) => {
    const store = useFederatedObservableStore();
    const {t, i18n} = useTranslation("psm");

    const addSurroundings = useCallback((operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: CoreResourceReader,
        forDataPsmClass: DataPsmClass,
     }) => {
        const addClassSurroundings = new AddClassSurroundings(operation.forDataPsmClass, operation.sourcePimModel, operation.resourcesToAdd);
        addClassSurroundings.labelRules = {
            languages: i18n.languages as string[],
            namingConvention: "snake_case",
            specialCharacters: "allow",
        };
        store.executeComplexOperation(addClassSurroundings).then();
    }, [store, i18n.languages]);

    return <>
        <MenuItem onClick={() => open({
            selected: addSurroundings
        })} title={t("button add")}><AddIcon/></MenuItem>
    </>;
};

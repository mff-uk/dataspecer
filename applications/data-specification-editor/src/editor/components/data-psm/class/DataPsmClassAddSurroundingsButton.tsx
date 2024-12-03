import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import AddIcon from "@mui/icons-material/Add";
import { MenuItem } from "@mui/material";
import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { UseDialogOpenFunction } from "../../../dialog";
import { AddClassSurroundings } from "../../../operations/add-class-surroundings";
import { AddInterpretedSurroundingsDialog } from "../../add-interpreted-surroundings";
import { ConfigurationContext } from "../../App";

export const DataPsmClassAddSurroundingsButton: React.FC<{open: UseDialogOpenFunction<typeof AddInterpretedSurroundingsDialog, "dataPsmClassIri">}> = ({open}) => {
    const store = useFederatedObservableStore();
    const {t} = useTranslation("psm");
    const {operationContext} = useContext(ConfigurationContext);

    const addSurroundings = useCallback((operation: {
        resourcesToAdd: [string, boolean][],
        sourcePimModel: SemanticModelEntity[],
        forDataPsmClass: DataPsmClass,
     }) => {
        const addClassSurroundings = new AddClassSurroundings(operation.forDataPsmClass, operation.sourcePimModel, operation.resourcesToAdd);
        addClassSurroundings.setContext(operationContext);
        store.executeComplexOperation(addClassSurroundings).then();
    }, [store, operationContext]);

    return <>
        <MenuItem onClick={() => open({
            selected: addSurroundings
        })} title={t("button add")}><AddIcon/></MenuItem>
    </>;
};

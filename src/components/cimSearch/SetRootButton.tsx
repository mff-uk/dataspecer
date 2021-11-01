import React, {useCallback} from "react";
import {Fab} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {SearchDialog} from "./SearchDialog";
import {useToggle} from "../../hooks/useToggle";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {PimClass} from "model-driven-data/pim/model";
import {CreateRootClass} from "../../operations/create-root-class";
import {CreateSchema} from "../../operations/create-schema";
import {MemoryStore} from "model-driven-data/core";
import {dataPsmExecutors} from "model-driven-data/data-psm/executor";
import {pimExecutors} from "model-driven-data/pim/executor";

const SetRootButton: React.FC = () => {
    const {store, setPsmSchemas} = React.useContext(StoreContext);
    const {isOpen, open, close} = useToggle();
    const {t} = useTranslation("ui");

    const setRootClass = useCallback(async (cls: PimClass) => {
        setPsmSchemas([]);

        store.getStores().forEach(s => store.removeStore(s));

        const memoryStore = MemoryStore.create("//", [...dataPsmExecutors, ...pimExecutors]);
        store.addStore({
            store: memoryStore,
            metadata: {},
        });

        const schemaOperation = new CreateSchema("//pim/", "//dataPsm/");
        await store.executeOperation(schemaOperation);
        setPsmSchemas([schemaOperation.createdDataPsmSchema as string]);

        store.executeOperation(new CreateRootClass(cls)).then();
    }, [store]);

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

import React, {useCallback} from "react";
import {Fab} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {SearchDialog} from "./search-dialog";
import {useToggle} from "../../hooks/useToggle";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../App";
import {PimClass} from "@model-driven-data/core/pim/model";
import {CreateRootClass} from "../../operations/create-root-class";
import {CreateSchema} from "../../operations/create-schema";
import {MemoryStore} from "@model-driven-data/core/core";
import {dataPsmExecutors} from "@model-driven-data/core/data-psm/executor";
import {pimExecutors} from "@model-driven-data/core/pim/executor";
import {selectLanguage} from "../../utils/selectLanguage";
import {languages} from "../../i18n";

function formatString(input: string, args: {[key: string]: string}): string {
    return input.replace(/{([^}]+)}/g, (match, key) => args[key]);
}

const ButtonSetRoot: React.FC = () => {
    const {store, setPsmSchemas, configuration, psmSchemas} = React.useContext(StoreContext);
    const {isOpen, open, close} = useToggle();
    const {t, i18n} = useTranslation("ui");
    // t('new schema description format')
    // t('new schema label format')

    const setRootClass = useCallback(async (cls: PimClass) => {
        setPsmSchemas([]);

        if (!configuration) {
            store.getStores().forEach(s => store.removeStore(s));

            const memoryStore = MemoryStore.create("https://ofn.gov.cz", [...dataPsmExecutors, ...pimExecutors]);
            store.addStore({
                store: memoryStore,
                metadata: {
                    tags: ["pim", "data-psm", "root"],
                },
            });
        }

        const schemaOperation = new CreateSchema("//pim/", "//dataPsm/");
        await store.executeOperation(schemaOperation);
        setPsmSchemas([schemaOperation.createdDataPsmSchema as string]);

        const newSchemaLabel = Object.fromEntries(
            languages.map(
                lang => [
                    lang,
                    formatString(
                        i18n.getFixedT([lang], "ui")('new schema label format'),
                        {
                            label: selectLanguage(cls.pimHumanLabel ?? {}, [lang]) ?? "",
                            description: selectLanguage(cls.pimHumanDescription ?? {}, [lang]) ?? "",
                        }
                    )
                ]
            )
        );

        const newSchemaDescription = Object.fromEntries(
            languages.map(
                lang => [
                    lang,
                    formatString(
                        i18n.getFixedT([lang], "ui")('new schema description format'),
                        {
                            label: selectLanguage(cls.pimHumanLabel ?? {}, [lang]) ?? "",
                            description: selectLanguage(cls.pimHumanDescription ?? {}, [lang]) ?? "",
                        }
                    )
                ]
            )
        );

        store.executeOperation(new CreateRootClass(cls, newSchemaLabel, newSchemaDescription)).then();
    }, [store, configuration, i18n, setPsmSchemas]);

    return <>
        {(configuration === undefined || psmSchemas.length === 0) &&
            <Fab variant="extended" size="medium" color="primary" onClick={open}>
                <AccountTreeTwoToneIcon style={{marginRight: ".25em"}}/>
                {t("set root element button")}
            </Fab>
        }
        <SearchDialog isOpen={isOpen} close={close} selected={setRootClass}/>
    </>;
};

export default ButtonSetRoot;

import React, {useCallback, useContext} from "react";
import {Button} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {SearchDialog} from "./search-dialog";
import {useToggle} from "../../hooks/use-toggle";
import {useTranslation} from "react-i18next";
import {ConfigurationContext} from "../App";
import {PimClass} from "@dataspecer/core/pim/model";
import {CreateRootClass} from "../../operations/create-root-class";
import {selectLanguage} from "../../utils/select-language";
import {languages} from "../../i18n";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";

function formatString(input: string, args: {[key: string]: string}): string {
    return input.replace(/{([^}]+)}/g, (match, key) => args[key]);
}

const ButtonSetRoot: React.FC = () => {
    const {dataPsmSchemaIri, dataSpecificationIri, dataSpecifications, operationContext} = useContext(ConfigurationContext);
    const store = useFederatedObservableStore();
    const {isOpen, open, close} = useToggle();
    const {t, i18n} = useTranslation("ui");
    // t('new schema description format')
    // t('new schema label format')

    const setRootClass = useCallback(async (cls: PimClass) => {
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

        if (dataSpecificationIri && dataPsmSchemaIri && dataSpecifications[dataSpecificationIri].pim) {
            const op = new CreateRootClass(cls, dataSpecifications[dataSpecificationIri].pim as string, dataPsmSchemaIri, newSchemaLabel, newSchemaDescription);
            op.setContext(operationContext);
            store.executeComplexOperation(op).then();
        }
    }, [dataSpecificationIri, dataPsmSchemaIri, dataSpecifications, i18n, operationContext, store]);

    return <>
        {
            <Button variant="contained" onClick={open}>
                <AccountTreeTwoToneIcon style={{marginRight: ".25em"}}/>
                {t("set root element button")}
            </Button>
        }
        <SearchDialog isOpen={isOpen} close={close} selected={setRootClass}/>
    </>;
};

export default ButtonSetRoot;

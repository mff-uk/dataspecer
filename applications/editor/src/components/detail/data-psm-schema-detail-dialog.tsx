import React, {memo} from "react";
import {DialogContentText, Tab, Tabs} from "@mui/material";
import {useTranslation} from "react-i18next";
import {selectLanguage} from "../../utils/select-language";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {ResourceInStore} from "./components/resource-in-store";
import {Show} from "../helper/Show";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {DataPsmSchemaCard} from "./components/data-psm-schema-card";


export const DataPsmSchemaDetailDialog: React.FC<{iri: string} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, close}) => {
    const {resource} = useResource<DataPsmSchema>(iri);
    const {t, i18n} = useTranslation("detail");

    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState(0);
    const label = resource?.dataPsmHumanLabel ?? {};
    const description = resource?.dataPsmHumanDescription ?? {};

    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title schema")}: </strong>
            {selectLanguage(label, i18n.languages) ?? <i>{t("no label")}</i>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={description} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>}>
        <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
            <Tab label={t('tab schema')}/>
            <Tab label={t('tab store')}/>
        </Tabs>

        <Show when={tab === 0}><DataPsmSchemaCard iri={iri} onClose={close}/></Show>
        {tab === 1 && <>
            <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)} sx={{mb: 3}}>
                <Tab label={t('tab data psm')}/>
            </Tabs>

            {storeTab === 0 && <ResourceInStore iri={iri}/>}
        </>}
    </DialogWrapper>;
}));

import React, {memo} from "react";
import {DialogContentText, Tab, Tabs} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAttribute} from "@model-driven-data/core/lib/data-psm/model";
import {PimAttribute} from "@model-driven-data/core/lib/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {BasicInfo} from "./components/basic-info";
import {ResourceInStore} from "./components/resource-in-store";
import {useLabelAndDescription} from "../../hooks/use-label-and-description";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";
import {Show} from "../helper/Show";
import {dialog, DialogParameters} from "../../dialog";
import {DialogWrapper} from "./common";

export const DataPsmAttributeDetailDialog: React.FC<{iri: string} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo(({iri, close}) => {
    const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute} = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(iri);
    const {t, i18n} = useTranslation("detail");
    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState(0);
    const [label, description] = useLabelAndDescription(dataPsmAttribute, pimAttribute);

    return <DialogWrapper close={close} title={<>
        <div>
            <strong>{t("title attribute")}: </strong>
            {selectLanguage(label, i18n.languages) ?? <i>{t("no label")}</i>}
            {pimAttribute?.pimInterpretation && <CimLinks iri={pimAttribute.pimInterpretation}/>}
        </div>

        <DialogContentText>
            {selectLanguage(description, i18n.languages) ?? <i>{t("no description")}</i>}
        </DialogContentText>

        <CloseDialogButton onClick={close} />
    </>}>
        <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
            <Tab label={t('tab basic info')} />
            <Tab label={t('tab store')} />
        </Tabs>

        <Show when={tab === 0}><BasicInfo iri={iri} label={label} description={description} close={close} /></Show>
        {tab === 1 && <>
            <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)} sx={{ mb: 3 }}>
                <Tab label={t('tab data psm')} />
                {dataPsmAttribute?.dataPsmInterpretation && <Tab label={t('tab pim')} />}
            </Tabs>

            {storeTab === 0 && <ResourceInStore iri={iri} />}
            {storeTab === 1 && dataPsmAttribute?.dataPsmInterpretation &&
            <ResourceInStore iri={dataPsmAttribute.dataPsmInterpretation} />}
        </>}
    </DialogWrapper>
}));

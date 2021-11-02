import React, {memo} from "react";
import {Dialog, DialogContent, DialogContentText, DialogTitle, Tab, Tabs} from "@mui/material";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {PimClass} from "model-driven-data/pim/model";
import {useTranslation} from "react-i18next";
import {selectLanguage} from "../../utils/selectLanguage";
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {DataPsmClassCard} from "./components/data-psm-class-card";
import {ResourceInStore} from "./components/resource-in-store";
import {DialogParameters} from "../dialog-parameters";
import {useLabelAndDescription} from "../../hooks/use-label-and-description";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";
import {Show} from "../helper/Show";

export const DataPsmClassDetailDialog: React.FC<{iri: string} & DialogParameters> = memo(({iri, isOpen, close}) => {
    const resources = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(iri);
    const {t, i18n} = useTranslation("detail");

    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState(0);
    const [label, description] = useLabelAndDescription(resources.dataPsmResource, resources.pimResource);

    return <Dialog open={isOpen} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle>
            {selectLanguage(label, i18n.languages) ?? <i>unnamed class</i>}
            {resources.pimResource?.pimInterpretation && <CimLinks iri={resources.pimResource.pimInterpretation}/>}

            <CloseDialogButton onClick={close} />
        </DialogTitle>

        <DialogContent>
            <DialogContentText>
                <LanguageStringFallback from={description} fallback={<i>no description for association</i>}/>
            </DialogContentText>

            <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
                <Tab label={t('tab class')}/>
                <Tab label={t('tab store')}/>
            </Tabs>

            <Show when={tab === 0}><DataPsmClassCard iri={iri} onClose={close}/></Show>
            {tab === 1 && <>
                <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)} sx={{mb: 3}}>
                    <Tab label={t('tab data psm')}/>
                    {resources.dataPsmResource?.dataPsmInterpretation && <Tab label={t('tab pim')}/>}
                </Tabs>

                {storeTab === 0 && <ResourceInStore iri={iri}/>}
                {storeTab === 1 && resources.dataPsmResource?.dataPsmInterpretation &&
                <ResourceInStore iri={resources.dataPsmResource.dataPsmInterpretation}/>}
            </>}
        </DialogContent>
    </Dialog>;
});

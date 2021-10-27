import React, {memo} from "react";
import {Dialog, DialogContent, DialogContentText, DialogTitle, Tab, Tabs} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmAttribute} from "model-driven-data/data-psm/model";
import {PimAttribute} from "model-driven-data/pim/model";
import {selectLanguage} from "../../utils/selectLanguage";
import {BasicInfo} from "./components/basic-info";
import {ResourceInStore} from "./components/resource-in-store";
import {DialogParameters} from "../dialog-parameters";
import {useLabelAndDescription} from "../../hooks/use-label-and-description";
import {CimLinks} from "./components/cim-links";
import {CloseDialogButton} from "./components/close-dialog-button";

export const DataPsmAttributeDetailDialog: React.FC<{iri: string} & DialogParameters> = memo(({iri, isOpen, close}) => {
    const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute, isLoading} = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(iri);
    const {t, i18n} = useTranslation("detail");
    const [tab, setTab] = React.useState(0);
    const [storeTab, setStoreTab] = React.useState(0);
    const [label, description] = useLabelAndDescription(dataPsmAttribute, pimAttribute);

    return <Dialog open={isOpen} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle>
            {selectLanguage(label, i18n.languages) ?? <i>Unnamed resource</i>}
            {pimAttribute?.pimInterpretation && <CimLinks iri={pimAttribute.pimInterpretation}/>}

            <CloseDialogButton onClick={close} />
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                {selectLanguage(description, i18n.languages) ?? <i>Without description</i>}
            </DialogContentText>
            <Tabs centered value={tab} onChange={(e, ch) => setTab(ch)}>
                <Tab label={t('tab basic info')} />
                <Tab label={t('tab store')} />
            </Tabs>

            {tab === 0 && <BasicInfo iri={iri} label={label} description={description} close={close} />}
            {tab === 1 && <>
                <Tabs value={storeTab} onChange={(e, ch) => setStoreTab(ch)} sx={{ mb: 3 }}>
                    <Tab label={t('tab data psm')} />
                    {dataPsmAttribute?.dataPsmInterpretation && <Tab label={t('tab pim')} />}
                </Tabs>

                {storeTab === 0 && <ResourceInStore iri={iri} />}
                {storeTab === 1 && dataPsmAttribute?.dataPsmInterpretation &&
                <ResourceInStore iri={dataPsmAttribute.dataPsmInterpretation} />}
            </>}
        </DialogContent>
    </Dialog>
});

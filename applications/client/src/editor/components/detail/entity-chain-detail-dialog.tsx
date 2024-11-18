import { ExtendedSemanticModelClass, ExtendedSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmClassReference, DataPsmInclude, DataPsmOr, DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Box, DialogContentText, FormControlLabel, Switch, Tab, Tabs, Typography } from "@mui/material";
import React, { FC, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogParameters, dialog } from "../../dialog";
import { useDataPsmAndInterpretedPim } from "../../hooks/use-data-psm-and-interpreted-pim";
import { useLabelAndDescription } from "../../hooks/use-label-and-description";
import { selectLanguage } from "../../utils/select-language";
import { LanguageStringFallback } from "../helper/LanguageStringComponents";
import { Show } from "../helper/Show";
import { DialogWrapper } from "./common";
import { CimLinks } from "./components/cim-links";
import { DataPsmAssociationEndCard } from "./components/data-psm-association-end-card";
import { DataPsmAttributeCard } from "./components/data-psm-attribute-card";
import { DataPsmClassCard } from "./components/data-psm-class-card";
import { DataPsmOrCard } from "./components/data-psm-or-card";
import { DataPsmSchemaCard } from "./components/data-psm-schema-card";
import { ResourceInStore } from "./components/resource-in-store";

/**
 * Detail and edit dialog for a chain of entities, usually from a single line of
 * the bullet-list representation of a PSM tree.
 */
export const EntityChainDetailDialog: React.FC<{
    // List of IRIs to directly show in the dialog
    iris: string[],
} & DialogParameters> = dialog({maxWidth: "lg", fullWidth: true}, memo((props) => {
    const {t} = useTranslation("detail");

    // Current tab selected
    const [tab, setTab] = useState(0);
    const [showStoreInfo, setShowStoreInfo] = useState(false);

    return <DialogWrapper close={props.close} title={props.iris.map(iri => <TitleItem iri={iri} key={iri} />)} >

        <Box sx={{display: "flex", alignItems: "center"}}>
            <Tabs sx={{flexGrow: 1}} centered value={tab} onChange={(_, ch) => setTab(ch)}>
                {props.iris.map(iri => <Tab label={<TabItem iri={iri} />} key={iri} />)}
            </Tabs>

            <Box>
                <FormControlLabel control={<Switch value={showStoreInfo} onChange={() => setShowStoreInfo(!showStoreInfo)} />} label={t('show store info')} />
            </Box>
        </Box>

        {props.iris.map((iri, index) => <Show when={tab === index && !showStoreInfo} key={iri}>
            <ContentItem iri={iri} onClose={props.close} />
        </Show>)}

        {showStoreInfo && <StoreInfo iri={props.iris[tab]} />}
    </DialogWrapper>;
}));

const StoreInfo : FC<{iri: string}> = (props) => {
    const {resource} = useResource(props.iri);
    const [tab, setTab] = React.useState(0);
    const {t} = useTranslation("detail");

    const pimIri = (resource as DataPsmClass & DataPsmAttribute & DataPsmAssociationEnd).dataPsmInterpretation ?? null;

    return <>
        <Tabs value={tab} onChange={(_, ch) => setTab(ch)}>
            <Tab label={t('tab data psm')} />
            {(resource as DataPsmClass & DataPsmAttribute & DataPsmAssociationEnd).dataPsmInterpretation && <Tab label={t('tab pim')} />}
        </Tabs>


        <ResourceInStore iri={(tab === 1 && pimIri) ? pimIri : props.iri} />
    </>;
}

const ContentItem: FC<{iri: string, onClose: () => void}> = (props) => {
    const {resource} = useResource(props.iri);

    if (!resource) {
        return <ContentUnknownItem {...props} />;
    } else if (DataPsmClass.is(resource)) {
        return <DataPsmClassCard {...props} />;
    } else if (DataPsmAttribute.is(resource)) {
        return <DataPsmAttributeCard {...props} />;
    } else if (DataPsmAssociationEnd.is(resource)) {
        return <DataPsmAssociationEndCard {...props} />;
    } else if (DataPsmSchema.is(resource)) {
        return <DataPsmSchemaCard {...props} />;
    } else if (DataPsmOr.is(resource)) {
        return <DataPsmOrCard {...props} />;
    } else {
        return <ContentUnknownItem {...props} />;
    }
}

const ContentUnknownItem: FC<{iri: string}> = () => {
    const {t} = useTranslation("detail");
    return <Typography>{t('nothing here')}</Typography>;
}

const TitleItem: FC<{iri: string}> = ({iri}) => {
    const {resource} = useResource(iri);

    if (!resource) {
        return null;
    } else if (DataPsmClass.is(resource)) {
        return <TitleItemClass iri={iri} />;
    } else if (DataPsmAttribute.is(resource)) {
        return <TitleItemAttribute iri={iri} />;
    } else if (DataPsmAssociationEnd.is(resource)) {
        return <TitleItemAssociation iri={iri} />;
    } else if (DataPsmSchema.is(resource)) {
        return <TitleItemSchema iri={iri} />;
    } else {
        return null;
    }
}

const TitleItemAssociation: FC<{iri: string}> = ({iri}) => {
    const {t, i18n} = useTranslation("detail");

    const associationEnd = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, SemanticModelRelationship>(iri);

    const [associationEndLabel, associationEndDescription] = useLabelAndDescription(associationEnd.dataPsmResource, associationEnd.pimResource);

    return <>
        <div>
            <strong>{t("title association")}: </strong>
            {selectLanguage(associationEndLabel, i18n.languages) ?? <i>{t("no label")}</i>}
            {associationEnd.relationshipEnd?.iri && <CimLinks iri={associationEnd.relationshipEnd.iri}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={associationEndDescription} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>;
}

const TitleItemClass: FC<{iri: string}> = ({iri}) => {
    const resources = useDataPsmAndInterpretedPim<DataPsmClass, ExtendedSemanticModelClass>(iri);
    const {t, i18n} = useTranslation("detail");

    const [label, description] = useLabelAndDescription(resources.dataPsmResource, resources.pimResource);

    return <>
        <div>
            <strong>{t("title class")}: </strong>
            {selectLanguage(label, i18n.languages) ?? <i>{t("no label")}</i>}
            {resources.pimResource?.iri && <CimLinks iri={resources.pimResource.iri}/>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={description} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>;
}

const TitleItemAttribute: FC<{iri: string}> = ({iri}) => {
    const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute} = useDataPsmAndInterpretedPim<DataPsmAttribute, ExtendedSemanticModelRelationship>(iri);
    const {t, i18n} = useTranslation("detail");

    const [label, description] = useLabelAndDescription(dataPsmAttribute, pimAttribute);

    return <>
        <div>
            <strong>{t("title attribute")}: </strong>
            {selectLanguage(label, i18n.languages) ?? <i>{t("no label")}</i>}
            {pimAttribute?.ends[1]?.iri && <CimLinks iri={pimAttribute.ends[1].iri}/>}
        </div>

        <DialogContentText>
            {selectLanguage(description, i18n.languages) ?? <i>{t("no description")}</i>}
        </DialogContentText>
    </>;
}

const TitleItemSchema: FC<{iri: string}> = ({iri}) => {
    const {resource} = useResource<DataPsmSchema>(iri);
    const {t, i18n} = useTranslation("detail");

    const label = resource?.dataPsmHumanLabel ?? {};
    const description = resource?.dataPsmHumanDescription ?? {};

    return <>
        <div>
            <strong>{t("title schema")}: </strong>
            {selectLanguage(label, i18n.languages) ?? <i>{t("no label")}</i>}
        </div>

        <DialogContentText>
            <LanguageStringFallback from={description} fallback={<i>{t("no description")}</i>}/>
        </DialogContentText>
    </>;
}


const TabItem = ({iri}: {iri: string}) => {
    const {resource} = useResource(iri);
    const {t} = useTranslation("detail");

    if (!resource) {
        return <>{t('tab unknown')}</>;
    } else if (DataPsmClass.is(resource)) {
        return <>{t('tab class')}</>;
    } else if (DataPsmAttribute.is(resource)) {
        return <>{t('tab attribute')}</>;
    } else if (DataPsmAssociationEnd.is(resource)) {
        return <>{t('tab association')}</>;
    } else if (DataPsmClassReference.is(resource)) {
        return <>{t('tab reference')}</>;
    } else if (DataPsmInclude.is(resource)) {
        return <>{t('tab include')}</>;
    } else if (DataPsmOr.is(resource)) {
        return <>{t('tab or')}</>;
    } else if (DataPsmSchema.is(resource)) {
        return <>{t('tab schema')}</>;
    } else {
        return <>{t('tab unknown')}</>;
    }
}

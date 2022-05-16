import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {Grid, Switch, TextField, Typography} from "@mui/material";
import {InDifferentLanguages} from "./InDifferentLanguages";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {DataPsmSchemaXmlExtension} from "@dataspecer/core/data-psm/xml-extension/model";
import {useTranslation} from "react-i18next";
import {useSaveHandler} from "../../helper/save-handler";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {XmlSetSchemaNamespace} from "../../../operations/xml-set-schema-namespace";

export const DataPsmSchemaCard: React.FC<{ iri: string, onClose: () => void  }> = memo(({iri}) => {
    const {t} = useTranslation("detail");
    const store = useFederatedObservableStore();

    const {resource} = useResource<DataPsmSchema>(iri);
    const label = resource?.dataPsmHumanLabel ?? {};
    const description = resource?.dataPsmHumanDescription ?? {};

    const xmlData = useMemo(() => resource ?
      DataPsmSchemaXmlExtension.getExtensionData(resource) : null,
      [resource]
    );

    const [namespaceEnabled, setNamespaceEnabled] = useState(xmlData !== null && (xmlData.namespace !== null || xmlData.namespacePrefix !== null));
    const [namespace, setNamespace] = useState(xmlData?.namespace ?? "");
    const [namespacePrefix, setNamespacePrefix] = useState(xmlData?.namespacePrefix ?? "");

    useEffect(() => {
        if (xmlData) {
            const enabled = xmlData.namespace !== null || xmlData.namespacePrefix !== null;
            setNamespaceEnabled(enabled);
            if (enabled) {
                setNamespace(xmlData.namespace as string);
                setNamespacePrefix(xmlData.namespacePrefix as string);
            }
        }
    }, [xmlData]);

    useSaveHandler(xmlData !== null &&
      (xmlData.namespace !== (namespaceEnabled ? namespace : null) ||
      xmlData.namespacePrefix !== (namespaceEnabled ? namespacePrefix : null)),
      useCallback(
        async () => await store.executeComplexOperation(
          new XmlSetSchemaNamespace(
            iri,
            namespaceEnabled ? namespacePrefix : null,
            namespaceEnabled ? namespace : null
          )),
        [store, iri, namespaceEnabled, namespacePrefix, namespace]
      ),
    );

    return <>
        <Grid container spacing={5} sx={{pt: 3}}>
            <Grid item xs={6}>
                <InDifferentLanguages label={label} description={description} iri={iri} resourceType="dataPsm"/>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h6" component="h2">
                    {t('XML attributes')}
                </Typography>

                <Typography variant="subtitle1" component="h2" sx={{mt: 2}}>
                    <Switch
                      checked={namespaceEnabled}
                      onChange={e => setNamespaceEnabled(e.target.checked)}
                    />
                    {t('XML namespace')}
                </Typography>

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                        <TextField
                          margin="dense"
                          label={t('XML prefix')}
                          fullWidth
                          variant="filled"
                          value={namespacePrefix}
                          onChange={event => setNamespacePrefix(event.target.value)}
                          disabled={!namespaceEnabled}
                        />
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                          margin="dense"
                          label={t('XML namespace')}
                          fullWidth
                          variant="filled"
                          value={namespace}
                          onChange={event => setNamespace(event.target.value)}
                          disabled={!namespaceEnabled}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </>;
});

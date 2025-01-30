import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { DataPsmSchemaXmlExtension } from "@dataspecer/core/data-psm/xml-extension/model";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Alert, Box, Collapse, FormControlLabel, Grid, Switch, TextField, Typography } from "@mui/material";
import { isEqual } from "lodash";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InfoHelp } from "../../../../components/info-help";
import { SetCardinalityPsm } from "../../../operations/set-cardinality";
import { SetRootCollection } from "../../../operations/set-root-collection";
import { SetTechnicalLabel } from "../../../operations/set-technical-label";
import { XmlSetSchemaNamespace } from "../../../operations/xml-set-schema-namespace";
import { Cardinality, CardinalitySelector } from "../../helper/cardinality-selector";
import { useSaveHandler } from "../../helper/save-handler";
import { InDifferentLanguages } from "./InDifferentLanguages";
import { skip } from "node:test";
import { XmlSetSkipRootElement } from "../../../operations/xml-set-skip-root-element";

function cardinalityFromPsm(entity?: DataPsmSchema): Cardinality {
  return {
    cardinalityMin: entity?.dataPsmCardinality ? entity.dataPsmCardinality[0] : 1,
    cardinalityMax: entity?.dataPsmCardinality ? entity.dataPsmCardinality[1] : 1,
  };
}

const defaultXmlContainer = "root";

export const DataPsmSchemaCard: React.FC<{ iri: string; onClose: () => void }> = memo(({ iri }) => {
  const { t } = useTranslation("detail");
  const store = useFederatedObservableStore();

  const { resource } = useResource<DataPsmSchema>(iri);
  const label = resource?.dataPsmHumanLabel ?? {};
  const description = resource?.dataPsmHumanDescription ?? {};

  const xmlData = useMemo(() => (resource ? DataPsmSchemaXmlExtension.getExtensionData(resource) : null), [resource]);

  const [namespaceEnabled, setNamespaceEnabled] = useState(
    xmlData !== null && (xmlData.namespace !== null || xmlData.namespacePrefix !== null)
  );
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

  useSaveHandler(
    xmlData !== null &&
      (xmlData.namespace !== (namespaceEnabled ? namespace : null) ||
        xmlData.namespacePrefix !== (namespaceEnabled ? namespacePrefix : null)),
    useCallback(
      async () =>
        await store.executeComplexOperation(
          new XmlSetSchemaNamespace(iri, namespaceEnabled ? namespacePrefix : null, namespaceEnabled ? namespace : null)
        ),
      [store, iri, namespaceEnabled, namespacePrefix, namespace]
    )
  );

  const [technicalLabel, setTechnicalLabel] = useState<string>("");
  useEffect(() => {
    setTechnicalLabel(resource?.dataPsmTechnicalLabel ?? "");
  }, [resource]);
  useSaveHandler(
    resource !== null && (resource.dataPsmTechnicalLabel ?? "") !== technicalLabel,
    useCallback(
      async () =>
        resource &&
        (await store.executeComplexOperation(new SetTechnicalLabel(resource.iri as string, technicalLabel))),
      [resource, store, technicalLabel]
    )
  );

  // region cardinality
  const [cardinality, setCardinality] = useState<Cardinality>(cardinalityFromPsm());

  useEffect(() => {
    setCardinality(cardinalityFromPsm(resource));
  }, [resource]);

  useSaveHandler(
    resource && !isEqual(cardinality, cardinalityFromPsm(resource)),
    useCallback(
      async () =>
        resource &&
        (await store.executeComplexOperation(
          new SetCardinalityPsm(iri, cardinality.cardinalityMin, cardinality.cardinalityMax)
        )),
      [resource, iri, store, cardinality]
    )
  );
  // endregion

  // region xml container
  const [rootCollection, setRootCollection] = useState<{
    enforce: boolean;
    technicalLabel: string | null;
  }>({
    enforce: false,
    technicalLabel: null,
  });
  useEffect(() => {
    if (resource) {
      setRootCollection({
        enforce: resource.dataPsmEnforceCollection,
        technicalLabel: resource.dataPsmCollectionTechnicalLabel,
      });
    }
  }, [resource]);
  useSaveHandler(
    resource &&
      !isEqual(rootCollection, {
        enforce: resource.dataPsmEnforceCollection,
        technicalLabel: resource.dataPsmCollectionTechnicalLabel,
      }),
    useCallback(
      async () =>
        resource &&
        (await store.executeComplexOperation(
          new SetRootCollection(iri, rootCollection.enforce, rootCollection.technicalLabel)
        )),
      [resource, rootCollection]
    )
  );
  const currentXmlContainer = rootCollection.technicalLabel && rootCollection.technicalLabel.length > 0 ? rootCollection.technicalLabel : defaultXmlContainer;
  // endregion

  // region skip root element
  const [skipRootElement, setSkipRootElement] = useState(xmlData.skipRootElement === true);
  useEffect(() => {
    if (xmlData) {
      setSkipRootElement(xmlData.skipRootElement === true);
    }
  }, [xmlData]);
  useSaveHandler(
    xmlData !== null &&
    (xmlData.skipRootElement === true) !== skipRootElement,
    useCallback(
      async () =>
        await store.executeComplexOperation(
          new XmlSetSkipRootElement(iri, skipRootElement)
        ),
      [store, iri, skipRootElement]
    )
  );
  // endregion

  return (
    <>
      <Grid container spacing={5} sx={{ pt: 3 }}>
        <Grid item xs={6}>
          <InDifferentLanguages label={label} description={description} iri={iri} resourceType="dataPsm" />
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" component="h2">
              {t("label technical label")}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              //label={t('label technical label')}
              hiddenLabel
              fullWidth
              variant="filled"
              value={technicalLabel}
              onChange={(event) => setTechnicalLabel(event.target.value)}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" component="h2">
              {t("title cardinality")}{" "}
              <InfoHelp text="Určuje kolikrát se v datech může vyskytovat kořenový element. Toto nastavení je specifické pro různé formáty a může způsobit obalení schématu do pomocné struktury pro dosažení požadované kardniality." />
            </Typography>

            {cardinality && <CardinalitySelector value={cardinality} onChange={setCardinality} />}
          </Box>

          <Typography variant="h6" component="h2">
            {t("XML attributes")}
          </Typography>

          <Typography variant="subtitle1" component="h2" sx={{ mt: 2 }}>
            <Switch checked={namespaceEnabled} onChange={(e) => setNamespaceEnabled(e.target.checked)} />
            {t("XML namespace")}
          </Typography>

          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <TextField
                margin="dense"
                label={t("XML prefix")}
                fullWidth
                variant="filled"
                value={namespacePrefix}
                onChange={(event) => setNamespacePrefix(event.target.value)}
                disabled={!namespaceEnabled}
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                margin="dense"
                label={t("XML namespace")}
                fullWidth
                variant="filled"
                value={namespace}
                onChange={(event) => setNamespace(event.target.value)}
                disabled={!namespaceEnabled}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" component="h2" sx={{ mt: 2 }}>
              <Switch checked={skipRootElement} onChange={(e) => setSkipRootElement(e.target.checked)} />
              {t("XML skip root element")}
            </Typography>

            <Collapse in={!skipRootElement}>
              <Typography variant="subtitle1" component="h2">
                Název kořenového elementu sloužícího jako kontejner
                <InfoHelp text="V příadě kardinality kořenového elementu jiné než 1..1 je potřeba obalit elementy do pomocného elementu. Toto nastavení specifikuje název takového elementu." />
              </Typography>

              <Collapse in={!isEqual(cardinality, cardinalityFromPsm()) && !rootCollection.enforce}>
                <Alert severity="info">
                  Kontejner <code>&lt;{currentXmlContainer}&gt;</code> bude použit vždy, protože je kardinalita jiná než 1..1.
                </Alert>
              </Collapse>

              <div style={{ display: "flex", gap: ".5em", alignItems: "flex-start" }}>
                <FormControlLabel
                  sx={{ mt: 2, flexShrink: 0 }}
                  control={<Switch checked={rootCollection.enforce} onChange={(e) => setRootCollection(c => ({...c, enforce: e.target.checked}))} />}
                  label="použít vždy"
                />
                <TextField
                  autoFocus
                  margin="dense"
                  hiddenLabel
                  fullWidth
                  variant="filled"
                  value={rootCollection.technicalLabel}
                  onChange={(event) => setRootCollection(c => ({...c, technicalLabel: event.target.value}))}
                />
              </div>
            </Collapse>
          </Box>
        </Grid>
      </Grid>
    </>
  );
});

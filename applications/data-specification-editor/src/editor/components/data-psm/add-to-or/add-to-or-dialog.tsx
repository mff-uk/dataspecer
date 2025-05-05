import { isSemanticModelClass, SemanticModelClass, SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Box, Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { dialog, useDialog } from "../../../dialog";
import { useAsyncMemo } from "../../../hooks/use-async-memo";
import { ExternalEntityWrapped } from "@dataspecer/core-v2/hierarchical-semantic-aggregator";
import { isAncestorOf } from "../../../utils/is-ancestor-of";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { Item } from "../replace-along-inheritance/item";

export const AddToOrDialog = dialog<{
  // Data Psm class IRI that is going to be replaced by another class.
  typePimClassIri: string,
  onSelected: (semanticClassId: string) => void,
}>({ maxWidth: "sm", fullWidth: true }, memo(({ typePimClassIri, onSelected, close }) => {
  const { t } = useTranslation("psm");

  const { resource: pimResource } = useResource<SemanticModelClass>(typePimClassIri);
  const semanticClassId = pimResource?.id;

  const { semanticModelAggregator } = React.useContext(ConfigurationContext);
  const [fullInheritance] = useAsyncMemo(async () => semanticClassId ? await semanticModelAggregator.getHierarchyForLookup(pimResource.id) : null, [semanticClassId]);

  const PimClassDetail = useDialog(PimClassDetailDialog);

  const [descendantsOrSelf] = useAsyncMemo(async () => {
    if (!fullInheritance || !semanticClassId) {
      return [];
    }

    const middleClassIri = semanticClassId;

    const descendants: ExternalEntityWrapped<SemanticModelClass>[] = [];

    const unwrappedFullInheritance = fullInheritance.map((entity) => entity.aggregatedEntity);
    const resources = fullInheritance.filter(((entity) => isSemanticModelClass(entity.aggregatedEntity)) as (entity) => entity is ExternalEntityWrapped<SemanticModelEntity>);
    for (const resource of resources) {
      if (isAncestorOf(unwrappedFullInheritance, middleClassIri, resource.aggregatedEntity.id)) {
        descendants.push(resource as ExternalEntityWrapped<SemanticModelClass>);
      }
    }

    return descendants;
  }, [fullInheritance], []) as [ExternalEntityWrapped<SemanticModelClass>[], boolean];

  return <>
    <DialogTitle>
      {t("add to or dialog.title")}
    </DialogTitle>
    <DialogContent>
      <Box style={{ maxHeight: 400, overflow: 'auto' }}>
        {descendantsOrSelf.map(resource => <Item
          semanticModelClass={resource}
          onClick={async () => {
            const localEntity = await semanticModelAggregator.externalEntityToLocalForHierarchyExtension(pimResource.id, resource, false, fullInheritance);
            onSelected(localEntity.aggregatedEntity.id);
          }}
          onInfo={() => PimClassDetail.open({ iri: resource.aggregatedEntity.id })}
        />)}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>{t("cancel")}</Button>
    </DialogActions>
    <PimClassDetail.Component />
  </>
}));

import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang, getUsageNote } from "../util/language-utils";
import { EntityRow } from "./entity-catalog-row";
import { useCreateUsageDialog } from "../dialog/create-usage-dialog";
import { sourceModelOfEntity } from "../util/model-utils";
import { InMemoryEntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import { tailwindColorToHex } from "~/app/utils/color-utils";

export const UsageCatalog = () => {
    const { aggregatorView, models: m } = useModelGraphContext();
    const { classes, relationships, attributes, usages } = useClassesContext();
    const { openEntityDetailDialog, EntityDetailDialog, isEntityDetailDialogOpen } = useEntityDetailDialog();
    const { CreateUsageDialog, openCreateUsageDialog, isCreateUsageDialogOpen } = useCreateUsageDialog();
    const { ModifyEntityDialog, openModifyEntityDialog, isModifyEntityDialogOpen } = useModifyEntityDialog();

    const models = [...m.values()];

    return (
        <>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            <ul>
                {usages.map((u) => {
                    const [usageName, usageNameFallbackLang] = getStringFromLanguageStringInLang(u.name ?? {});
                    const [usageDescription, usageDescriptionFallbackLang] = getStringFromLanguageStringInLang(
                        u.description ?? {}
                    );
                    const note = getUsageNote(u);
                    const targetEntity =
                        classes.get(u.usageOf)?.cls ?? relationships.find((r) => r.id == u.usageOf) ?? null;
                    const [targetName, targetDescription] = getNameOrIriAndDescription(
                        targetEntity,
                        targetEntity?.iri ?? u.usageOf
                    );

                    const sourceModel = sourceModelOfEntity(u.id, models);
                    const modifiable =
                        sourceModel instanceof InMemorySemanticModel
                            ? {
                                  openModificationHandler: () => openModifyEntityDialog(u, sourceModel),
                              }
                            : null;

                    const drawable = isSemanticModelClassUsage(u)
                        ? {
                              addToViewHandler: () => {
                                  const updateStatus = aggregatorView
                                      .getActiveVisualModel()
                                      ?.updateEntity(u.id, { visible: true });
                                  if (!updateStatus) {
                                      aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: u.id });
                                  }
                              },
                              removeFromViewHandler: () => {
                                  aggregatorView.getActiveVisualModel()?.updateEntity(u.id, { visible: false });
                              },
                              isVisibleOnCanvas: () =>
                                  aggregatorView.getActiveVisualModel()?.getVisualEntity(u.id)?.visible ?? false,
                          }
                        : null;

                    const color =
                        (sourceModel && aggregatorView.getActiveVisualModel()?.getColor(sourceModel.getId())) ??
                        "#ffffff";

                    return (
                        <div style={{ backgroundColor: tailwindColorToHex(color) }}>
                            <EntityRow
                                entity={u}
                                expandable={null}
                                openDetailHandler={() => openEntityDetailDialog(u)}
                                modifiable={modifiable}
                                drawable={drawable}
                                removable={null}
                                usage={{
                                    createUsageHandler: () => openCreateUsageDialog(u),
                                }}
                            />
                        </div>
                    );
                })}
            </ul>
        </>
    );
};

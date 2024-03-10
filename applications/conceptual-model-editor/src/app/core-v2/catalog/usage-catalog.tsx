import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang, getUsageNote } from "../util/language-utils";
import { EntityRow } from "./entity-catalog-row";
import { useCreateUsageDialog } from "../dialog/create-usage-dialog";

export const UsageCatalog = () => {
    const { aggregatorView } = useModelGraphContext();
    const { classes, relationships, attributes, usages } = useClassesContext();
    const { openEntityDetailDialog, EntityDetailDialog, isEntityDetailDialogOpen } = useEntityDetailDialog();
    const { CreateUsageDialog, openCreateUsageDialog, isCreateUsageDialogOpen } = useCreateUsageDialog();
    console.log(usages);
    return (
        <>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
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

                    return (
                        <EntityRow
                            entity={u}
                            expandable={null}
                            openDetailHandler={() => openEntityDetailDialog(u)}
                            modifiable={null}
                            drawable={drawable}
                            removable={null}
                            usage={{
                                createUsageHandler: () => openCreateUsageDialog(u),
                            }}
                        />
                    );
                })}
            </ul>
        </>
    );
};

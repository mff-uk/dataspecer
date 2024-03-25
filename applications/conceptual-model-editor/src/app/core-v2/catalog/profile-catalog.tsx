import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { EntityRow } from "./entity-catalog-row";
import { useCreateProfileDialog } from "../dialog/create-profile-dialog";
import { sourceModelOfEntity } from "../util/model-utils";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import { tailwindColorToHex } from "~/app/utils/color-utils";

export const ProfileCatalog = () => {
    const { aggregatorView, models: m } = useModelGraphContext();
    const { profiles } = useClassesContext();
    const { openEntityDetailDialog, EntityDetailDialog, isEntityDetailDialogOpen } = useEntityDetailDialog();
    const { CreateProfileDialog, openCreateProfileDialog, isCreateProfileDialogOpen } = useCreateProfileDialog();
    const { ModifyEntityDialog, openModifyEntityDialog, isModifyEntityDialogOpen } = useModifyEntityDialog();

    const models = [...m.values()];

    return (
        <>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateProfileDialogOpen && <CreateProfileDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            <ul>
                {profiles.map((p) => {
                    const sourceModel = sourceModelOfEntity(p.id, models);
                    const modifiable =
                        sourceModel instanceof InMemorySemanticModel
                            ? {
                                  openModificationHandler: () => openModifyEntityDialog(p, sourceModel),
                              }
                            : null;

                    const drawable = isSemanticModelClassUsage(p)
                        ? {
                              addToViewHandler: () => {
                                  const updateStatus = aggregatorView
                                      .getActiveVisualModel()
                                      ?.updateEntity(p.id, { visible: true });
                                  if (!updateStatus) {
                                      aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: p.id });
                                  }
                              },
                              removeFromViewHandler: () => {
                                  aggregatorView.getActiveVisualModel()?.updateEntity(p.id, { visible: false });
                              },
                              isVisibleOnCanvas: () =>
                                  aggregatorView.getActiveVisualModel()?.getVisualEntity(p.id)?.visible ?? false,
                          }
                        : null;

                    const color =
                        (sourceModel && aggregatorView.getActiveVisualModel()?.getColor(sourceModel.getId())) ??
                        "#ffffff";

                    return (
                        <div style={{ backgroundColor: tailwindColorToHex(color) }}>
                            <EntityRow
                                entity={p}
                                expandable={null}
                                openDetailHandler={() => openEntityDetailDialog(p)}
                                modifiable={modifiable}
                                drawable={drawable}
                                removable={null}
                                profile={{
                                    createProfileHandler: () => openCreateProfileDialog(p),
                                }}
                            />
                        </div>
                    );
                })}
            </ul>
        </>
    );
};

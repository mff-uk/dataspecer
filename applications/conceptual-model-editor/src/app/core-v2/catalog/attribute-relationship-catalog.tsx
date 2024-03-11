import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useCreateUsageDialog } from "../dialog/create-usage-dialog";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { getNameOrIriAndDescription } from "../util/language-utils";
import { sourceModelOfEntity } from "../util/model-utils";
import { EntityRow } from "./entity-catalog-row";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

const AttributeOrRelationshipRow = (props: {
    name: string;
    liTitle: string;
    liKey: string;
    entityHref: string;
    detailHandler: () => void;
    usageHandler: () => void;
}) => {
    return (
        <li title={props.liTitle} key={props.liKey}>
            <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
                <span className="overflow-x-clip">
                    <a href={props.entityHref} target="_blank">
                        📑
                    </a>
                    {props.name}
                </span>
                <div>
                    <button onClick={props.detailHandler}>Detail</button>
                    <button onClick={props.usageHandler}>🥑</button>
                </div>
            </div>
        </li>
    );
};

export const AttributeCatalog = () => {
    const { attributes, deleteEntityFromModel } = useClassesContext();
    const { models: m } = useModelGraphContext();
    const { isEntityDetailDialogOpen, openEntityDetailDialog, EntityDetailDialog } = useEntityDetailDialog();
    const { isCreateUsageDialogOpen, openCreateUsageDialog, CreateUsageDialog } = useCreateUsageDialog();
    const { isModifyEntityDialogOpen, openModifyEntityDialog, ModifyEntityDialog } = useModifyEntityDialog();

    const models = [...m.values()];

    return (
        <>
            <ul>
                {attributes.map((v) => {
                    const attr = v.ends.at(1)!;
                    const [name, description] = getNameOrIriAndDescription(attr, v.iri ?? "no-name");

                    const model = sourceModelOfEntity(v.id, models);
                    let removeHandler: { remove: () => void } | null = null;
                    let modifyHandler: { openModificationHandler: () => void } | null = null;
                    if (model instanceof InMemorySemanticModel) {
                        removeHandler = {
                            remove: () => {
                                deleteEntityFromModel(model, v.id);
                            },
                        };
                        if (isSemanticModelClass(v)) {
                            modifyHandler = {
                                openModificationHandler: () => {
                                    openModifyEntityDialog(v, model);
                                },
                            };
                        }
                    }

                    return (
                        // <div>
                        //     <EntityRow
                        //         entity={v}
                        //         expandable={null}
                        //         openDetailHandler={() => openEntityDetailDialog(v)}
                        //         modifiable={modifyHandler}
                        //         drawable={null}
                        //         removable={removeHandler}
                        //         usage={{ createUsageHandler: () => openCreateUsageDialog(v) }}
                        //     />
                        // </div>

                        <AttributeOrRelationshipRow
                            liKey={v.id}
                            liTitle={description || ""}
                            name={name ?? ""}
                            entityHref={v.iri ?? "#"}
                            detailHandler={() => openEntityDetailDialog(v)}
                            usageHandler={() => openCreateUsageDialog(v)}
                        />
                    );
                })}
            </ul>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
        </>
    );
};

export const RelationshipCatalog = () => {
    const { relationships } = useClassesContext();
    const { isEntityDetailDialogOpen, openEntityDetailDialog, EntityDetailDialog } = useEntityDetailDialog();
    const { isCreateUsageDialogOpen, openCreateUsageDialog, CreateUsageDialog } = useCreateUsageDialog();
    return (
        <>
            <ul>
                {relationships.map((r) => {
                    const [name, description] = getNameOrIriAndDescription(r, r.iri ?? "no-name");
                    return (
                        <AttributeOrRelationshipRow
                            liKey={r.id}
                            liTitle={description || ""}
                            name={name ?? ""}
                            entityHref={r.iri ?? "#"}
                            detailHandler={() => openEntityDetailDialog(r)}
                            usageHandler={() => openCreateUsageDialog(r)}
                        />
                    );
                })}
            </ul>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
        </>
    );
};

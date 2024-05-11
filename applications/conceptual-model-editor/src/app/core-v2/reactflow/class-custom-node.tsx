import { Handle, Position, XYPosition, Node } from "reactflow";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { useModelGraphContext } from "../context/model-context";
import { useMemo } from "react";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { EntityProxy } from "../util/detail-utils";
import { useMenuOptions } from "./components/menu-options";
import { ClassNodeAttributeRow, ThreeDotsRow } from "./components/attribute-row";
import { ClassNodeHeader } from "./components/class-node-header";

type ClassCustomNodeDataType = {
    cls: SemanticModelClass | SemanticModelClassUsage;
    color: string | undefined;
    attributes: SemanticModelRelationship[];
    openEntityDetailDialog: () => void;
    openModifyDialog: () => void;
    openProfileDialog: () => void;
    attributeUsages: SemanticModelRelationshipUsage[];
};

export const ClassCustomNode = (props: { data: ClassCustomNodeDataType }) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { models, aggregatorView } = useModelGraphContext();
    const { deleteEntityFromModel } = useClassesContext();
    const { MenuOptions, isMenuOptionsOpen, openMenuOptions } = useMenuOptions();

    const { cls, attributes, attributeUsages } = props.data;

    const clr = props.data.color ?? "#ffffff";

    const model = useMemo(() => sourceModelOfEntity(cls.id, [...models.values()]), [models]);

    const { name, description, iri, profileOf } = EntityProxy(cls, preferredLanguage);

    const handleRemoveEntityFromActiveView = () => {
        aggregatorView.getActiveVisualModel()?.updateEntity(cls.id, { visible: false });
    };

    const isModelLocal = model instanceof InMemorySemanticModel;

    return (
        <>
            <div
                className="relative m-1 min-h-14 min-w-56 border border-black bg-white [&]:text-sm"
                onDoubleClick={(e) => {
                    openMenuOptions();
                    e.stopPropagation();
                }}
            >
                <ClassNodeHeader name={name} description={description} isProfileOf={profileOf} color={clr} />

                <p className="overflow-x-clip text-gray-500">{iri}</p>

                <div key={"attributes" + attributes.length} className="max-h-44 overflow-x-auto ">
                    <>
                        {attributes?.slice(0, 5).map((attr) => (
                            <ClassNodeAttributeRow attribute={attr} />
                        ))}
                        {attributes.length >= 5 && <ThreeDotsRow onClickHandler={props.data.openEntityDetailDialog} />}
                        {attributeUsages?.slice(0, 5).map((attr) => (
                            <ClassNodeAttributeRow attribute={attr} />
                        ))}
                        {attributeUsages.length >= 5 && (
                            <ThreeDotsRow onClickHandler={props.data.openEntityDetailDialog} />
                        )}
                    </>
                </div>
            </div>
            {isMenuOptionsOpen && (
                <MenuOptions
                    position="absolute right-2 top-2 z-10"
                    openDetailHandler={props.data.openEntityDetailDialog}
                    createProfileHandler={props.data.openProfileDialog}
                    removeFromViewHandler={handleRemoveEntityFromActiveView}
                    modifyHandler={isModelLocal ? props.data.openModifyDialog : undefined}
                    deleteHandler={isModelLocal ? () => deleteEntityFromModel(model, cls.id) : undefined}
                />
            )}
            <Handle type="source" position={Position.Top} id="sa">
                s
            </Handle>
            <Handle type="source" position={Position.Bottom} id="sc">
                s
            </Handle>
            <Handle type="target" position={Position.Right} id="tb">
                t
            </Handle>
            <Handle type="target" position={Position.Left} id="td">
                t
            </Handle>
            <Handle type="source" position={Position.Right} id="s-self" />
            <Handle type="target" position={Position.Right} id="t-self" />
        </>
    );
};

/**
 *
 * @param id VisualEntityId
 * @param cls
 * @param position
 * @param color
 * @returns
 */
export const semanticModelClassToReactFlowNode = (
    id: string,
    cls: SemanticModelClass | SemanticModelClassUsage,
    position: XYPosition,
    color: string | undefined, // FIXME: vymysli lip
    attributes: SemanticModelRelationship[],
    openEntityDetailDialog: () => void,
    openModifyDialog: () => void,
    openProfileDialog: () => void,

    attributeUsages: SemanticModelRelationshipUsage[]
) =>
    ({
        id: id,
        position: position ?? { x: 69, y: 420 },
        data: {
            cls,
            color /*FIXME: */,
            attributes,
            openEntityDetailDialog,
            openModifyDialog,
            openProfileDialog,
            attributeUsages,
        } satisfies ClassCustomNodeDataType,
        type: "classCustomNode",
    } as Node);

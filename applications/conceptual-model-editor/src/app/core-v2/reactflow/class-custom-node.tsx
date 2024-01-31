import { Handle, Position, XYPosition, Node } from "reactflow";
import { getDescriptionOf, getNameOf } from "../util/utils";
import { SemanticModelClass, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../dialogs/entity-detail-dialog";

export const ClassCustomNode = (props: {
    data: {
        cls: SemanticModelClass;
        color: string | undefined;
        attributes: SemanticModelRelationshipEnd[];
    };
}) => {
    const cls = props.data.cls;
    const { id, iri } = cls;
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();

    const clr = props.data.color ?? "#ffffff";
    const attributes = props.data.attributes;
    const clsName = getNameOf(cls);
    console.log("class-custom-node", cls, attributes);
    return (
        <>
            <div className={`m-1 border border-black [&]:text-sm`} style={{ backgroundColor: clr }}>
                <h1 className=" overflow-x-hidden whitespace-nowrap border border-b-black">
                    {`${clsName.t}@${clsName.l}`}
                </h1>

                <p className="overflow-x-clip">{iri}</p>

                {attributes?.map((attr) => {
                    const { t: nt, l: nl } = getNameOf(attr);
                    const { t: dt } = getDescriptionOf(attr);
                    return (
                        <p key={`${nt}.${attr.concept}`} title={dt}>
                            {nt}@{nl}
                        </p>
                    );
                })}

                <div className="flex flex-row justify-between">
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            console.log("edited class id: ", id);
                            alert("FIXME: editing class");
                        }}
                    >
                        edit
                    </button>
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            openEntityDetailDialog(cls);
                        }}
                    >
                        detail
                    </button>
                </div>
            </div>

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

            {isEntityDetailDialogOpen && <EntityDetailDialog />}
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
    cls: SemanticModelClass,
    position: XYPosition,
    color: string | undefined, // FIXME: vymysli lip
    attributes: SemanticModelRelationshipEnd[]
) =>
    ({
        id: id,
        position: position ?? { x: 69, y: 420 },
        data: { cls, color /*FIXME: */, attributes },
        type: "classCustomNode",
    } as Node);

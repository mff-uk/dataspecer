import { Handle, Position, XYPosition, Node } from "reactflow";
import { getNameOf } from "../util/utils";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../dialogs/entity-detail-dialog";

export const ClassCustomNode = (props: {
    data: {
        cls: SemanticModelClass;
        tailwindColor: string | undefined;
    };
}) => {
    const cls = props.data.cls;
    const { id, iri } = cls;
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();

    const clr = props.data.tailwindColor ?? "bg-white";
    const clsName = getNameOf(cls);
    return (
        <>
            <div className={`m-1 border border-black [&]:text-sm ${clr}`}>
                <h1 className=" overflow-x-hidden whitespace-nowrap border border-b-black">
                    {`${clsName.t}@${clsName.l}`}
                </h1>

                <p className="overflow-x-clip">{iri}</p>

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

            <Handle type="source" position={Position.Top} id="sa" />
            {/* <Handle type="source" position={Position.Right} id="sb" /> */}
            <Handle type="source" position={Position.Bottom} id="sc" />
            {/* <Handle type="source" position={Position.Left} id="sd" /> */}
            {/* <Handle type="target" position={Position.Top} id="ta" /> */}
            <Handle type="target" position={Position.Right} id="tb" />
            {/* <Handle type="target" position={Position.Bottom} id="tc" /> */}
            <Handle type="target" position={Position.Left} id="td" />

            {isEntityDetailDialogOpen && <EntityDetailDialog /* cls={props.data.cls} */ />}
        </>
    );
};

export const semanticModelClassToReactFlowNode = (
    cls: SemanticModelClass,
    position: XYPosition,
    tailwindColor: string | undefined // FIXME: vymysli lip
) =>
    ({
        id: cls.id,
        position: position ?? { x: 69, y: 420 },
        data: { cls, tailwindColor /*FIXME: */ },
        type: "classCustomNode",
    } as Node);

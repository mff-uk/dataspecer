import { Handle, Position } from "reactflow";
import { getNameOf } from "../util/utils";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../entity-detail-dialog";

export const ClassCustomNode = (props: {
    data: {
        cls: SemanticModelClass;
        tailwindColor: string | undefined;
    };
}) => {
    const { id, iri } = props.data.cls;
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();

    const clr = props.data.tailwindColor ?? "bg-white";
    return (
        <>
            <div className={`m-1 border border-black [&]:text-sm ${clr}`}>
                <h1 className=" overflow-x-hidden whitespace-nowrap border border-b-black">
                    {getNameOf(props.data.cls)}
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
                            openEntityDetailDialog();
                            // console.log("detail of class id: ", id);
                            // alert("FIXME: show class detail");
                        }}
                    >
                        detail
                    </button>
                </div>
                {isEntityDetailDialogOpen && <EntityDetailDialog cls={props.data.cls} />}
            </div>

            <Handle type="source" position={Position.Top} id="sa" />
            <Handle type="source" position={Position.Right} id="sb" />
            <Handle type="source" position={Position.Bottom} id="sc" />
            <Handle type="source" position={Position.Left} id="sd" />
            <Handle type="target" position={Position.Top} id="ta" />
            <Handle type="target" position={Position.Right} id="tb" />
            <Handle type="target" position={Position.Bottom} id="tc" />
            <Handle type="target" position={Position.Left} id="td" />
        </>
    );
};

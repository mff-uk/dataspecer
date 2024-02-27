import { Handle, Position, XYPosition, Node } from "reactflow";
import { SemanticModelClass, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import {
    getStringFromLanguageStringInLang,
    getNameOfThingInLangOrIri,
    getNameOrIriAndDescription,
} from "../util/language-utils";

type ClassCustomNodeDataType = {
    cls: SemanticModelClass;
    color: string | undefined;
    attributes: SemanticModelRelationshipEnd[];
    openDialog: (cls: SemanticModelClass) => void;
    openModifyDialog: (cls: SemanticModelClass) => void;
};

export const ClassCustomNode = (props: { data: ClassCustomNodeDataType }) => {
    const cls = props.data.cls;
    const { id, iri } = cls;

    const clr = props.data.color ?? "#ffffff";
    const attributes = props.data.attributes;

    const [name, description] = getNameOrIriAndDescription(cls, iri ?? id);

    return (
        <>
            <div className={`m-1 border border-black bg-white [&]:text-sm`}>
                <h1
                    className="overflow-x-hidden whitespace-nowrap border border-b-black"
                    style={{ backgroundColor: clr }}
                >
                    {name}
                </h1>

                <p className="overflow-x-clip text-gray-500">{iri}</p>

                {attributes?.map((attr) => {
                    const [n, d] = getNameOrIriAndDescription(attr, "no-iri");
                    return (
                        <p key={`${n}.${attr.concept}`} title={d ?? ""}>
                            - {n}
                        </p>
                    );
                })}

                <div className="flex flex-row justify-between">
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            // props.data.openModifyDialog(cls);
                            // console.log("edited class id: ", id);
                            alert("FIXME: editing class");
                        }}
                    >
                        edit
                    </button>
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            props.data.openDialog(cls);
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
    cls: SemanticModelClass,
    position: XYPosition,
    color: string | undefined, // FIXME: vymysli lip
    attributes: SemanticModelRelationshipEnd[],
    openDialog: (cls: SemanticModelClass) => void,
    openModifyDialog: (cls: SemanticModelClass) => void
) =>
    ({
        id: id,
        position: position ?? { x: 69, y: 420 },
        data: { cls, color /*FIXME: */, attributes, openDialog, openModifyDialog } satisfies ClassCustomNodeDataType,
        type: "classCustomNode",
    } as Node);

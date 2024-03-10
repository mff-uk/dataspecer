import { Handle, Position, XYPosition, Node } from "reactflow";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    getStringFromLanguageStringInLang,
    getNameOfThingInLangOrIri,
    getNameOrIriAndDescription,
} from "../util/language-utils";
import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

type ClassCustomNodeDataType = {
    cls: SemanticModelClass | SemanticModelClassUsage;
    color: string | undefined;
    attributes: SemanticModelRelationship[];
    openEntityDetailDialog: (cls: SemanticModelClass | SemanticModelClassUsage) => void;
    openModifyDialog: (cls: SemanticModelClass) => void;
    usagesOfAttributes: SemanticModelClassUsage[];
};

export const ClassCustomNode = (props: { data: ClassCustomNodeDataType }) => {
    const cls = props.data.cls;
    const { id } = cls;

    const clr = props.data.color ?? "#ffffff";
    const attributes = props.data.attributes;

    let name: null | string = null,
        description: null | string = null,
        iri: null | string = null,
        isUsage = false;

    if (isSemanticModelClass(cls)) {
        [name, description] = getNameOrIriAndDescription(cls, cls.iri ?? id);
    } else if (isSemanticModelClassUsage(cls)) {
        const [a, b] = getStringFromLanguageStringInLang(cls.name ?? {});
        const [c, d] = getStringFromLanguageStringInLang(cls.description ?? cls.usageNote ?? {});
        [name, description, isUsage] = [
            (a ?? cls.id) + (b != null ? `@${b}` : ""),
            c ?? "" + (d != null ? `@${d}` : ""),
            true,
        ];
    }

    return (
        <>
            <div className={`m-1 min-w-56 border border-black bg-white [&]:text-sm`}>
                <h1
                    className="flex flex-col overflow-x-hidden whitespace-nowrap border border-b-black"
                    style={{ backgroundColor: clr }}
                    title={description ?? ""}
                >
                    {isUsage && <span className="text-center">profile</span>}
                    <span>{name}</span>
                </h1>

                <p className="overflow-x-clip text-gray-500">{iri}</p>

                {attributes?.map((attr) => {
                    const end = attr.ends[1]!;
                    const [n, d] = getNameOrIriAndDescription(end, "no-iri");

                    const usage = props.data.usagesOfAttributes.find((u) => u.usageOf == attr.id);
                    const [usageNote, l] = getStringFromLanguageStringInLang(usage?.usageNote ?? {});

                    return (
                        <p key={`${n}.${attr.id}`} title={d ?? ""} className="flex flex-row">
                            <span>- {n} </span>
                            {usage && (
                                <div className="ml-2 rounded-sm bg-blue-300" title={usageNote ?? ""}>
                                    usage info
                                </div>
                            )}
                        </p>
                    );
                })}

                <div className="flex flex-row justify-between">
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            alert("FIXME: editing class");
                        }}
                    >
                        edit
                    </button>
                    <button
                        className="text-slate-500"
                        onClick={() => {
                            props.data.openEntityDetailDialog(cls);
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
    cls: SemanticModelClass | SemanticModelClassUsage,
    position: XYPosition,
    color: string | undefined, // FIXME: vymysli lip
    attributes: SemanticModelRelationship[],
    openEntityDetailDialog: (cls: SemanticModelClass | SemanticModelClassUsage) => void,
    openModifyDialog: (cls: SemanticModelClass) => void,
    usagesOfAttributes: SemanticModelClassUsage[]
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
            usagesOfAttributes,
        } satisfies ClassCustomNodeDataType,
        type: "classCustomNode",
    } as Node);

import { Handle, Position, XYPosition, Node } from "reactflow";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { shortenStringTo } from "../util/utils";
import { useConfigurationContext } from "../context/configuration-context";
import { getNameLanguageString, getDescriptionLanguageString, getUsageNoteLanguageString } from "../util/name-utils";
import { getIri } from "../util/model-utils";

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
    const { cls, attributes, attributeUsages } = props.data;

    const clr = props.data.color ?? "#ffffff";

    let isUsage = false;

    const name = getLocalizedStringFromLanguageString(getNameLanguageString(cls), preferredLanguage);
    const description = getLocalizedStringFromLanguageString(getDescriptionLanguageString(cls), preferredLanguage);
    const usageNote = getLocalizedStringFromLanguageString(getUsageNoteLanguageString(cls), preferredLanguage);
    const iri = getIri(cls);
    if (isSemanticModelClassUsage(cls)) {
        isUsage = true;
    }

    console.log(attributeUsages, attributes);

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

                <div key={"attributes" + attributes.length}>
                    {attributes?.map((attr) => {
                        const n = getLocalizedStringFromLanguageString(getNameLanguageString(attr), preferredLanguage);
                        const d = getLocalizedStringFromLanguageString(
                            getDescriptionLanguageString(attr),
                            preferredLanguage
                        );
                        const un = getLocalizedStringFromLanguageString(
                            getUsageNoteLanguageString(attr),
                            preferredLanguage
                        );

                        return (
                            <p key={attr.id} title={d ?? ""} className="flex flex-row">
                                <span>- {n} </span>
                                {un && (
                                    <div className="ml-2 rounded-sm bg-blue-300" title={un}>
                                        usage info
                                    </div>
                                )}
                            </p>
                        );
                    })}
                </div>

                <div key={"attributeProfiles" + attributeUsages.length}>
                    {attributeUsages?.map((attr) => {
                        const n = getLocalizedStringFromLanguageString(getNameLanguageString(attr), preferredLanguage);
                        const d = getLocalizedStringFromLanguageString(
                            getDescriptionLanguageString(attr),
                            preferredLanguage
                        );
                        const un = getLocalizedStringFromLanguageString(
                            getUsageNoteLanguageString(attr),
                            preferredLanguage
                        );

                        const usageOf = attr.usageOf;

                        return (
                            <p key={attr.id} title={d ?? ""} className="flex flex-row">
                                <span>
                                    - {n}, profile of: {shortenStringTo(usageOf, 8)}{" "}
                                </span>
                                {un && (
                                    <div className="ml-2 rounded-sm bg-blue-300" title={un}>
                                        usage note
                                    </div>
                                )}
                            </p>
                        );
                    })}
                </div>

                <div className="flex flex-row justify-between">
                    <button className="text-slate-500" onClick={props.data.openModifyDialog}>
                        edit
                    </button>
                    <button className="text-slate-500" onClick={props.data.openEntityDetailDialog}>
                        detail
                    </button>
                    <button className="text-slate-500" onClick={props.data.openProfileDialog}>
                        profile
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

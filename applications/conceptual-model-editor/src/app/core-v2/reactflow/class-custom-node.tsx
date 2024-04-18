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
import {
    getNameLanguageString,
    getDescriptionLanguageString,
    getUsageNoteLanguageString,
    getFallbackDisplayName,
} from "../util/name-utils";
import { getIri, getModelIri, sourceModelOfEntity } from "../util/model-utils";
import { useModelGraphContext } from "../context/model-context";
import { useMemo, useState } from "react";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";

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
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const { deleteEntityFromModel } = useClassesContext();

    const { cls, attributes, attributeUsages } = props.data;

    const clr = props.data.color ?? "#ffffff";

    const model = useMemo(() => sourceModelOfEntity(cls.id, [...models.values()]), [models]);
    const modelIri = getModelIri(model);

    let isUsage = false;

    const name =
        getLocalizedStringFromLanguageString(getNameLanguageString(cls), preferredLanguage) ??
        getFallbackDisplayName(cls ?? null);
    const description = getLocalizedStringFromLanguageString(getDescriptionLanguageString(cls), preferredLanguage);
    const usageNote = getLocalizedStringFromLanguageString(getUsageNoteLanguageString(cls), preferredLanguage);
    const iri = getIri(cls);
    if (isSemanticModelClassUsage(cls)) {
        isUsage = true;
    }

    const MenuOptions = () => {
        return (
            <div
                style={{ pointerEvents: "all" }}
                className="absolute right-2 top-2 z-10 flex w-max flex-col bg-white [&>*]:px-5 [&>*]:text-left"
                onBlur={(e) => {
                    setIsMenuOptionsOpen(false);
                    e.stopPropagation();
                }}
            >
                <button
                    type="button"
                    className="text-red-700 hover:shadow"
                    onClick={(e) => {
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    close
                </button>
                <button
                    type="button"
                    className="hover:shadow"
                    onClick={(e) => {
                        props.data.openEntityDetailDialog();
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    open detail
                </button>
                <button
                    type="button"
                    className="hover:shadow"
                    onClick={(e) => {
                        props.data.openProfileDialog();
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    create profile
                </button>
                <button
                    type="button"
                    className="hover:shadow"
                    onClick={(e) => {
                        aggregatorView.getActiveVisualModel()?.updateEntity(cls.id, { visible: false });
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    remove from view
                </button>
                {model instanceof InMemorySemanticModel && (
                    <>
                        <button
                            type="button"
                            className="hover:shadow"
                            onClick={(e) => {
                                props.data.openModifyDialog();
                                setIsMenuOptionsOpen(false);
                                e.stopPropagation();
                            }}
                        >
                            modify
                        </button>
                        <button
                            type="button"
                            className="hover:shadow"
                            onClick={(e) => {
                                deleteEntityFromModel(model, cls.id);
                                setIsMenuOptionsOpen(false);
                                e.stopPropagation();
                            }}
                        >
                            delete
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            <div
                className="relative m-1 min-h-14 min-w-56 border border-black bg-white [&]:text-sm"
                onDoubleClick={(e) => {
                    setIsMenuOptionsOpen(true);
                    e.stopPropagation();
                }}
            >
                <h1
                    className="flex flex-col overflow-x-hidden whitespace-nowrap border border-b-black"
                    style={{ backgroundColor: clr }}
                    title={description ?? ""}
                >
                    {isUsage && <span className="text-center">profile</span>}
                    <div className="relative flex w-full flex-row justify-between">{name}</div>
                </h1>

                <p className="overflow-x-clip text-gray-500">
                    {modelIri}
                    {iri}
                </p>

                <div key={"attributes" + attributes.length}>
                    {attributes?.map((attr) => {
                        const n =
                            getLocalizedStringFromLanguageString(getNameLanguageString(attr), preferredLanguage) ??
                            getFallbackDisplayName(attr ?? null);
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
                        const n =
                            getLocalizedStringFromLanguageString(getNameLanguageString(attr), preferredLanguage) ??
                            getFallbackDisplayName(attr ?? null);
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

                {isMenuOptionsOpen && <MenuOptions />}
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

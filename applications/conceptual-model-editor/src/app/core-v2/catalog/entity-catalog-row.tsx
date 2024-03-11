import { useState } from "react";
import { SemanticModelClassWithOrigin } from "../context/classes-context";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang } from "../util/language-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
    LanguageString,
    NamedThing,
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";

export const IriLink = (props: { iri: string | undefined | null }) => {
    return (
        <a href={props.iri ? props.iri : "#"} target="_blank">
            📑
        </a>
    );
};

export const EntityRow = (props: {
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;
    expandable: null | {
        toggleHandler: () => void;
        expanded: () => boolean;
    };
    openDetailHandler: () => void;
    modifiable: null | { openModificationHandler: () => void };
    drawable: null | {
        addToViewHandler: () => void;
        removeFromViewHandler: () => void;
        isVisibleOnCanvas: () => boolean;
    };
    removable: null | {
        remove: () => void;
    };
    usage: null | {
        createUsageHandler: () => void;
    };
    offset?: number;
}) => {
    const [isVisible, setIsVisible] = useState(props.drawable?.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());

    const entity = props.entity;
    let iri: string | null = null;

    if (isSemanticModelClass(entity)) {
        iri = entity.iri;
    }

    const [name, description] = getNameOrIriAndDescription(
        { ...entity, name: entity.name ?? {}, description: {} } satisfies NamedThing,
        iri ?? entity.id
    );

    return (
        <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                {"-".repeat((props.offset ?? 0) * 2)}
                {name}
            </span>
            <div className="ml-2 flex flex-row bg-teal-300 px-1">
                {props.expandable && (
                    <button
                        className="ml-0.5"
                        onClick={() => {
                            if (!props.expandable) {
                                return;
                            }
                            props.expandable.toggleHandler();
                            setIsExpanded(props.expandable.expanded());
                        }}
                    >
                        {!isExpanded ? "❌ " : "✅ "}
                        Expand
                    </button>
                )}
                {props.removable && (
                    <button className="ml-0.5" onClick={props.removable.remove}>
                        🗑
                    </button>
                )}
                {props.modifiable && (
                    <button className="ml-0.5" onClick={props.modifiable.openModificationHandler}>
                        Modify
                    </button>
                )}
                <button className="ml-2" onClick={props.openDetailHandler}>
                    Detail
                </button>
                {props.drawable && (
                    <button
                        onClick={() => {
                            isVisible ? props.drawable?.removeFromViewHandler() : props.drawable?.addToViewHandler();
                            setIsVisible(props.drawable?.isVisibleOnCanvas());
                        }}
                    >
                        {isVisible ? "👁️" : "🕶"}
                    </button>
                )}
                <button onClick={props.usage?.createUsageHandler}>🥑</button>
            </div>
        </div>
    );
};

export const InputEntityRow = (props: { onClickHandler: (search: string) => void }) => {
    const [searchInput, setSearchInput] = useState("vozidlo");
    return (
        <div className="flex flex-row justify-between whitespace-nowrap pb-1 hover:shadow">
            <input
                onFocus={(e) => {
                    e.target.select();
                }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
                className="ml-2 flex flex-row bg-teal-300 px-1 pr-6"
                onClick={() => {
                    props.onClickHandler(searchInput);
                    setSearchInput("");
                }}
            >
                Search
            </button>
        </div>
    );
};

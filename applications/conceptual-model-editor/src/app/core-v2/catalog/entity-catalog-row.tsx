import { useState } from "react";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";

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
    profile: null | {
        createProfileHandler: () => void;
    };
    offset?: number;
}) => {
    const [isVisible, setIsVisible] = useState(props.drawable?.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());
    const { language: preferredLanguage } = useConfigurationContext();

    const entity = props.entity;
    let iri: string | null = null;

    if (isSemanticModelClass(entity)) {
        iri = entity.iri;
    }

    const name = getLocalizedStringFromLanguageString(getNameLanguageString(entity), preferredLanguage);
    const description = getLocalizedStringFromLanguageString(getDescriptionLanguageString(entity), preferredLanguage);

    return (
        <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                {props.offset && props.offset > 0 ? (
                    <span style={{ marginLeft: (props.offset - 1) * 12 }}>└-</span>
                ) : (
                    <></>
                )}
                {name}
            </span>
            <div className="ml-2 flex flex-row bg-teal-300 px-1 ">
                {props.expandable && (
                    <button
                        className="ml-0.5 hover:bg-teal-400"
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
                    <button className="ml-0.5 hover:bg-teal-400" title="remove entity" onClick={props.removable.remove}>
                        🗑
                    </button>
                )}
                {props.modifiable && (
                    <button
                        className="ml-0.5 hover:bg-teal-400"
                        title="modify entity"
                        onClick={props.modifiable.openModificationHandler}
                    >
                        ✏
                    </button>
                )}
                <button className="ml-2 hover:bg-teal-400" title="entity detail" onClick={props.openDetailHandler}>
                    ℹ
                </button>
                {props.drawable && (
                    <button
                        className="hover:bg-teal-400"
                        title="add/remove from diagram"
                        onClick={() => {
                            isVisible ? props.drawable?.removeFromViewHandler() : props.drawable?.addToViewHandler();
                            setIsVisible(props.drawable?.isVisibleOnCanvas());
                        }}
                    >
                        {isVisible ? "👁️" : "🕶"}
                    </button>
                )}
                <button
                    className={`hover:bg-teal-400 ${props.profile ? "" : "opacity-30"}`}
                    title={
                        props.profile
                            ? ""
                            : "don't make profiles here, possibly find the entity and make the profile there"
                    }
                    onClick={props.profile?.createProfileHandler}
                >
                    🥑
                </button>
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

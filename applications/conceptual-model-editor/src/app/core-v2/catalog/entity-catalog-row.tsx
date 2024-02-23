import { useState } from "react";
import { SemanticModelClassWithOrigin } from "../context/classes-context";
import { getNameOrIriAndDescription } from "../util/language-utils";

export const IriLink = (props: { iri: string | undefined | null }) => {
    return (
        <a href={props.iri ? props.iri : "#"} target="_blank">
            📑
        </a>
    );
};

export const EntityRow = (props: {
    cls: SemanticModelClassWithOrigin;
    expandable: null | {
        toggleHandler: () => void;
        expanded: () => boolean;
    };
    openDetailHandler: () => void;
    modifiable: null | { openModificationHandler: () => void };
    addToViewHandler: () => void;
    removeFromViewHandler: () => void;
    isVisibleOnCanvas: () => boolean;
    removable: null | {
        remove: () => void;
    };
    usage: null | {
        createUsageHandler: () => void;
    };
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());

    const cls = props.cls.cls;
    const iri = props.cls.cls.iri;

    const [name, description] = getNameOrIriAndDescription(cls, iri ?? "no-name", "en");

    return (
        <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
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
                <button
                    onClick={() => {
                        isVisible ? props.removeFromViewHandler() : props.addToViewHandler();
                        setIsVisible(props.isVisibleOnCanvas());
                    }}
                >
                    {isVisible ? "👁️" : "🕶"}
                </button>
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

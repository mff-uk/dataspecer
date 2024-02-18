import { useState } from "react";
import { SemanticModelClassWithOrigin } from "../context/classes-context";
import { shortenStringTo } from "../util/utils";
import { getNameOfThingInLang } from "../util/language-utils";

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
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());

    const cls = props.cls.cls;
    const iri = props.cls.cls.iri;

    const [name, fallbackLang] = getNameOfThingInLang(cls, "en");

    let displayName: string;
    if (name && !fallbackLang) {
        displayName = name;
    } else if (name && fallbackLang) {
        displayName = `${name}@${fallbackLang}`;
    } else {
        displayName = shortenStringTo(iri, 30) || "no-name";
    }

    return (
        <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
            <span className="overflow-x-clip" title={iri ?? ""}>
                <a href={iri ? iri : "#"} target="_blank">
                    📑
                </a>
                {displayName}
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
            </div>
        </div>
    );
};

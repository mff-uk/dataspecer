import { useState } from "react";
import { SemanticModelClassWithOrigin } from "../context/classes-context";
import { getNameOf } from "../util/utils";

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
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());

    const cls = props.cls.cls;
    const iri = props.cls.cls.iri;
    return (
        <div className="flex flex-row justify-between whitespace-nowrap">
            <span>
                <a href={iri ? iri : "#"} target="_blank">
                    📑
                </a>
                {getNameOf(cls).t}
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
                        {isExpanded ? "❌ " : "✅ "}
                        Expand
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

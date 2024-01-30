import { useState } from "react";
import { SemanticModelClassWithOrigin } from "../context/classes-context";
import { getNameOf } from "../util/utils";

export const ExpandableRow = (props: {
    cls: SemanticModelClassWithOrigin;
    toggleHandler: () => void;
    expanded: () => boolean;
    openDetailHandler: () => void;
    addToViewHandler: () => void;
    removeFromViewHandler: () => void;
    isVisibleOnCanvas: () => boolean;
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());
    const [isExpanded, setIsExpanded] = useState(props.expanded());
    const cls = props.cls.cls;
    return (
        <div className="flex flex-row justify-between whitespace-nowrap">
            <span
                onClick={() => {
                    props.toggleHandler();
                    setIsExpanded(props.expanded());
                }}
            >
                {isExpanded ? "❌" : "✅"}
                {getNameOf(cls).t}
            </span>
            <div className="ml-2 flex flex-row bg-teal-300 px-1">
                <button onClick={props.openDetailHandler}>Detail</button>
                <button
                    onClick={() => {
                        isVisible ? props.removeFromViewHandler() : props.addToViewHandler();
                        setIsVisible(props.isVisibleOnCanvas());
                    }}
                    className={isVisible ? "opacity-30" : ""}
                >
                    👁️
                </button>
            </div>
        </div>
    );
};

export const ModifiableRow = (props: {
    cls: SemanticModelClassWithOrigin;
    openDetailHandler: () => void;
    openModificationHandler: () => void;
    addToViewHandler: () => void;
    removeFromViewHandler: () => void;
    isVisibleOnCanvas: () => boolean;
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());

    return (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls).t}
            <div className="bg-teal-300 px-1">
                <button className="ml-0.5" onClick={props.openModificationHandler}>
                    Modify
                </button>
                <button className="ml-2" onClick={props.openDetailHandler}>
                    Detail
                </button>
                <button
                    onClick={() => {
                        isVisible ? props.removeFromViewHandler() : props.addToViewHandler();
                        setIsVisible(props.isVisibleOnCanvas());
                    }}
                    className={isVisible ? "opacity-30" : ""}
                >
                    👁️
                </button>
            </div>
        </div>
    );
};

export const NonExpandableRow = (props: {
    cls: SemanticModelClassWithOrigin;
    openDetailHandler: () => void;
    addToViewHandler: () => void;
    removeFromViewHandler: () => void;
    isVisibleOnCanvas: () => boolean;
}) => {
    const [isVisible, setIsVisible] = useState(props.isVisibleOnCanvas());

    console.log("rerendering non-expandable row");

    return (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls).t}
            <div className="bg-teal-300 px-1">
                <button className="ml-2" onClick={props.openDetailHandler}>
                    Detail
                </button>
                <button
                    onClick={() => {
                        isVisible ? props.removeFromViewHandler() : props.addToViewHandler();
                        setIsVisible(props.isVisibleOnCanvas());
                    }}
                    className={isVisible ? "opacity-30" : ""}
                >
                    👁️
                </button>
            </div>
        </div>
    );
};

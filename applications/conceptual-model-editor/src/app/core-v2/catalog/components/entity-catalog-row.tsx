import { useState } from "react";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useConfigurationContext } from "../../context/configuration-context";
import { EntityModel } from "@dataspecer/core-v2";
import { EntityProxy } from "../../util/detail-utils";
import { IriLink } from "./iri-link";
import {
    CreateProfileButton,
    DrawOnCanvasButton,
    ExpandButton,
    ModifyButton,
    OpenDetailButton,
    RemoveButton,
} from "./buttons";

const TreeLikeOffset = (props: { offset?: number }) => {
    const { offset } = props;
    if (!offset || offset <= 0) {
        return;
    }
    return <span style={{ marginLeft: (offset - 1) * 12 }}>└-</span>;
};

export const EntityRow = (props: {
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;
    expandable: null | {
        toggleHandler: () => void;
        expanded: () => boolean;
    };
    openDetailHandler: () => void;
    modifiable: null | { openModificationHandler: () => void };
    visibleOnCanvas?: boolean;
    drawable: null | {
        addToViewHandler: () => void;
        removeFromViewHandler: () => void;
    };
    removable: null | {
        remove: () => void;
    };
    profile: null | {
        createProfileHandler: () => void;
    };
    sourceModel?: EntityModel;
    offset?: number;
}) => {
    let defaultVisibility: boolean;
    if (isSemanticModelClass(props.entity) || isSemanticModelClassUsage(props.entity)) {
        defaultVisibility = false;
    } else {
        defaultVisibility = true;
    }

    const [isExpanded, setIsExpanded] = useState(props.expandable?.expanded());
    const { language: preferredLanguage } = useConfigurationContext();

    const entity = props.entity;

    const { name, iri } = EntityProxy(entity, preferredLanguage);

    return (
        <div className="flex flex-row justify-between whitespace-nowrap hover:shadow">
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                <TreeLikeOffset offset={props.offset} />
                {name}
            </span>
            <div className="ml-2 flex flex-row bg-teal-300 px-1 ">
                {props.expandable && (
                    <ExpandButton
                        onClickHandler={() => {
                            props.expandable?.toggleHandler();
                            setIsExpanded(props.expandable?.expanded());
                        }}
                        isExpanded={isExpanded}
                    />
                )}
                {props.removable && <RemoveButton onClickHandler={props.removable.remove} />}
                {props.modifiable && <ModifyButton onClickHandler={props.modifiable.openModificationHandler} />}
                <OpenDetailButton onClick={props.openDetailHandler} />
                {props.drawable && (
                    <DrawOnCanvasButton
                        visible={props.visibleOnCanvas}
                        addToCanvas={props.drawable?.addToViewHandler}
                        removeFromCanvas={props.drawable?.removeFromViewHandler}
                    />
                )}
                <CreateProfileButton onClickHandler={props.profile?.createProfileHandler} />
            </div>
        </div>
    );
};

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
import { IriLink } from "../iri-link";
import {
    CreateProfileButton,
    DrawOnCanvasButton,
    ExpandButton,
    ModifyButton,
    OpenDetailButton,
    RemoveButton,
} from "../buttons";
import { onDragStart } from "../../reactflow/utils";
import { useCanvasVisibility } from "../../util/canvas-utils";

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
    const { entity, offset, drawable, expandable, modifiable, profile, removable } = props;
    const isDraggable = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);
    const { isOnCanvas } = useCanvasVisibility(entity.id);

    const [isExpanded, setIsExpanded] = useState(expandable?.expanded());
    const { language: preferredLanguage } = useConfigurationContext();

    const { name, iri } = EntityProxy(entity, preferredLanguage);

    return (
        <div
            className="flex flex-row justify-between whitespace-nowrap hover:shadow"
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e as unknown as DragEvent, entity.id, "classNode")}
        >
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                <TreeLikeOffset offset={offset} />
                {name}
            </span>
            <div className="ml-2 flex flex-row bg-teal-300 px-1 ">
                {expandable && (
                    <ExpandButton
                        onClickHandler={() => {
                            expandable?.toggleHandler();
                            setIsExpanded(expandable?.expanded());
                        }}
                        isExpanded={isExpanded}
                    />
                )}
                {removable && <RemoveButton onClickHandler={removable.remove} />}
                {modifiable && <ModifyButton onClickHandler={modifiable.openModificationHandler} />}
                <OpenDetailButton onClick={props.openDetailHandler} />
                {drawable && (
                    <DrawOnCanvasButton
                        visible={isOnCanvas}
                        addToCanvas={drawable?.addToViewHandler}
                        removeFromCanvas={drawable?.removeFromViewHandler}
                    />
                )}
                <CreateProfileButton onClickHandler={profile?.createProfileHandler} />
            </div>
        </div>
    );
};

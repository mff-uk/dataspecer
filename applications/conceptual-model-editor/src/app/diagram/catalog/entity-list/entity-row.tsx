import { useState } from "react";

import type { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { EntityProxy } from "../../util/detail-utils";
import { useConfigurationContext } from "../../context/configuration-context";
import { IriLink } from "../../components/iri-link";
import { CreateProfileButton } from "../components/create-profile";
import { DrawOnCanvasButton } from "../components/draw-on-canvas";
import { ExpandButton } from "../components/expand";
import { OpenDetailButton } from "../components/open-detail";
import { RemoveButton } from "../components/remove";
import { onDragStart } from "../../reactflow/utils";
import { useDialogsContext } from "../../context/dialogs-context";
import { MoveViewportToEntityButton } from "../components/center-viewport-on-entity";

const TreeLikeOffset = (props: { offset?: number }) => {
    const { offset } = props;
    if (!offset || offset <= 0) {
        return;
    }
    return <span style={{ marginLeft: (offset - 1) * 12 }}>└-</span>;
};

/**
 * A single
 */
export const EntityRow = (props: {
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;
    expandable: null | {
        toggleHandler: () => void;
        expanded: () => boolean;
    };
    drawable: null | {
        addToViewHandler: () => void;
        removeFromViewHandler: () => void;
    };
    removable: null | {
        remove: () => void;
    };
    targetable: null | {
        centerViewportOnEntityHandler: () => void;
        isTargetable: boolean;
    };
    sourceModel?: EntityModel;
    offset?: number;
    isOnCanvas: boolean;
}) => {
    const { openDetailDialog, openModificationDialog, openProfileDialog } = useDialogsContext();
    const { language: preferredLanguage } = useConfigurationContext();

    const { entity, offset, drawable, expandable, removable, sourceModel } = props;
    const { name, iri } = EntityProxy(entity, preferredLanguage);

    const [isExpanded, setIsExpanded] = useState(expandable?.expanded());
    const isDraggable = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);

    const sourceModelIsLocal = sourceModel instanceof InMemorySemanticModel;

    return (
        <div
            className="flex flex-row justify-between flex-wrap whitespace-nowrap hover:shadow"
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e as unknown as DragEvent, entity.id, "classNode")}
        >
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                <TreeLikeOffset offset={offset} />
                {name}
            </span>
            <div className="ml-2 flex flex-row px-1 ">
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
                {sourceModelIsLocal && (
                    <button className="hover:bg-teal-400" title="Modify" onClick={() => openModificationDialog(entity, sourceModel)}>
                        ✏
                    </button>
                )}
                <OpenDetailButton onClick={() => openDetailDialog(entity)} />
                {drawable && (
                    <DrawOnCanvasButton
                        visible={props.isOnCanvas}
                        addToCanvas={drawable?.addToViewHandler}
                        removeFromCanvas={drawable?.removeFromViewHandler}
                    />
                )}
                <CreateProfileButton onClickHandler={() => openProfileDialog(entity)} />
                {props.targetable?.isTargetable
                    ? <MoveViewportToEntityButton disabled={!props.isOnCanvas} onClick={props.targetable?.centerViewportOnEntityHandler} />
                    : null}
            </div>
        </div>
    );
};

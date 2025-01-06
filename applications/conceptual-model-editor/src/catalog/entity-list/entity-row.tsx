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

import { useEntityProxy } from "../../util/detail-utils";
import { IriLink } from "../../components/iri-link";
import { CreateProfileButton } from "../components/create-profile";
import { DrawOnCanvasButton } from "../components/draw-on-canvas";
import { ExpandButton } from "../components/expand";
import { OpenDetailButton } from "../components/open-detail";
import { RemoveButton } from "../components/remove";
import { MoveViewportToEntityButton } from "../components/center-viewport-on-entity";
import { useOptions } from "../../application/options";
import { useActions } from "../../action/actions-react-binding";
import { AddNeighborhoodButton } from "../components/add-neighborhood-button";
import { useCatalogHighlightingController } from "../../diagram/features/highlighting/exploration/catalog/catalog-highlighting-controller";
import "../../diagram/features/highlighting/exploration/catalog/highlighting-catalog-styles.css";
import "../../diagram/features/highlighting/exploration/context/exploration-highlighting-styles.css";

const TreeLikeOffset = (props: { offset?: number }) => {
    const { offset } = props;
    if (!offset || offset <= 0) {
        return;
    }
    return <span style={{ marginLeft: (offset - 1) * 12 }}>└-</span>;
};

export const EntityRow = (props: {
    model: string,
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
    const { openDetailDialog, openModifyDialog, openCreateProfileDialog } = useActions();

    const { language: preferredLanguage } = useOptions();

    const { entity, offset, drawable, expandable, removable, sourceModel } = props;
    const { name, iri } = useEntityProxy(entity, preferredLanguage);

    const [isExpanded, setIsExpanded] = useState(expandable?.expanded());
    const isDraggable = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);

    const sourceModelIsLocal = sourceModel instanceof InMemorySemanticModel;

    const explorationHighlightingController = useCatalogHighlightingController();

    const actions = useActions();
    // Either we can shrink the catalog (the highlighting started from the canvas) or not, then we are shrinking only different models
    // TODO RadStr: The idea is nice, unfortunately if we shrink the models above the current (in the catalog), we will start the flickering
    //              (because the models shift up, which result in new classes (un)entering the cursor) -
    // So either do some trick, or just never shrink as it was before
    const shouldShrinkThisRow = (
                                    explorationHighlightingController.shouldShrinkCatalog ||
                                    explorationHighlightingController.modelOfClassWhichStartedHighlighting !== props.model
                                ) &&
                                !explorationHighlightingController.isEntityHighlighted(entity.id) &&
                                explorationHighlightingController.isAnyEntityHighlighted;

    const onMouseEnter = (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(explorationHighlightingController.isHighlightingChangeAllowed()) {
            actions.highlightNodeInExplorationModeFromCatalog(entity.id, props.model);
        }
    };

    return (shouldShrinkThisRow ? null :
        (<div
            className={explorationHighlightingController.getClassNames(entity.id)}
            draggable={isDraggable}
            onMouseEnter={onMouseEnter}
            onMouseLeave={(_) => explorationHighlightingController.resetHighlight()}
            // TODO Fix to use editor API.
            // onDragStart={(e) => onDragStart(e as unknown as DragEvent, props.model, entity.id, "classNode")}
        >
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                <TreeLikeOffset offset={offset} />
                {name}
            </span>
            <div className="ml-2 flex flex-row px-1 ">
                {props.targetable?.isTargetable
                    ? <MoveViewportToEntityButton onClick={props.targetable?.centerViewportOnEntityHandler} />
                    : null}
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
                    <button className="hover:bg-teal-400" title="Modify" onClick={() => openModifyDialog(entity.id)}>
                        ✏
                    </button>
                )}
                <OpenDetailButton onClick={() => openDetailDialog(entity.id)} />
                {drawable && (
                    <DrawOnCanvasButton
                        visible={props.isOnCanvas}
                        addToCanvas={drawable?.addToViewHandler}
                        removeFromCanvas={drawable?.removeFromViewHandler}
                    />
                )}
                <CreateProfileButton onClickHandler={() => openCreateProfileDialog(entity.id)} />
                <AddNeighborhoodButton entity={entity}></AddNeighborhoodButton>
            </div>
        </div>)
    );
};

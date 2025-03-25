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
import { useOptions } from "../../configuration/options";
import { useActions } from "../../action/actions-react-binding";
import { AddNeighborhoodButton } from "../components/add-neighborhood-button";
import { useCatalogHighlightingController } from "../../diagram/features/highlighting/exploration/catalog/catalog-highlighting-controller";
import "../../diagram/features/highlighting/exploration/catalog/highlighting-catalog-styles.css";
import "../../diagram/features/highlighting/exploration/context/exploration-highlighting-styles.css";
import { isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { getFallbackDisplayName, getNameLanguageString } from "../../util/name-utils";
import { getLocalizedStringFromLanguageString } from "../../util/language-utils";

const TreeLikeOffset = (props: { offset?: number }) => {
  const { offset } = props;
  if (!offset || offset <= 0) {
    return;
  }
  return <span style={{ marginLeft: (offset - 1) * 12 }}>└-</span>;
};

export const EntityRow = (props: {
    model: string,
    entity: SemanticModelClass | SemanticModelRelationship |
     SemanticModelClassUsage | SemanticModelRelationshipUsage |
     SemanticModelClassProfile | SemanticModelRelationshipProfile;
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
        centerViewportOnEntityHandler: (entityNumberToBeCentered: number) => void;
        isTargetable: boolean;
    };
    sourceModel?: EntityModel;
    offset?: number;
    isOnCanvas: boolean;
}) => {
  const { openDetailDialog, openModifyDialog, openCreateProfileDialog } = useActions();

  const { language } = useOptions();

  const { entity, offset, drawable, expandable, removable, sourceModel } = props;
  const { name, iri, domain } = useEntityProxy(entity, language);

  const [isExpanded, setIsExpanded] = useState(expandable?.expanded());
  const isDraggable = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);

  const sourceModelIsLocal = sourceModel instanceof InMemorySemanticModel;

  const explorationHighlightingController = useCatalogHighlightingController();

  const actions = useActions();
  // Either we can shrink the catalog (the highlighting started from the canvas) or not.
  // There was an idea to shrink all the models except the one where the main entity resides, but
  // unfortunately if we shrink the models above the current (in the catalog), we will start the flickering
  // (because the models shift up, which result in new classes (un)entering the cursor)
  const shouldShrinkThisRow = explorationHighlightingController.shouldShrinkCatalog &&
                                !explorationHighlightingController.isEntityHighlighted(entity.id) &&
                                explorationHighlightingController.isAnyEntityHighlighted;

  let effectiveName = name;
  const isRelationshipProfile = isSemanticModelRelationshipProfile(entity);
  if (isRelationshipProfile) {
    const domainName = getLocalizedStringFromLanguageString(
      getNameLanguageString(domain.entity ?? null), language) ??
        getFallbackDisplayName(domain.entity ?? null);

    effectiveName = `[${domainName}] ->  ${name}`;
  }

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
        {effectiveName}
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

import { DataPsmAssociationEnd, DataPsmClass, DataPsmContainer } from "@dataspecer/core/data-psm/model";
import { useFederatedObservableStore } from "@dataspecer/federated-observable-store-react/store";
import { useResource } from "@dataspecer/federated-observable-store-react/use-resource";
import { Collapse, ListItemIcon, MenuItem } from "@mui/material";
import React, { memo, useCallback, useId } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { TransitionGroup } from "react-transition-group";
import { DeleteProperty } from "../../../operations/delete-property";
import { MoveProperty } from "../../../operations/move-property";
import { DataPsmDeleteButton } from "../class/DataPsmDeleteButton";
import { InheritanceOrTree } from "../common/use-inheritance-or";
import { AssociationContext, DataPsmPropertyType, ObjectContext, ORContext } from "../data-psm-row";
import { DataPsmSpecializationItem } from "../entities/specialization";
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';

/**
 * Renders class parts (or class in specialization OR) as a subtree.
 *
 * Each property:
 *   1. can be removed by delete button
 *   2. can be moved by drag-and-drop
 */
export const DataPsmClassSubtree: React.FC<{iri: string, parentDataPsmClassIri: string, isOpen: boolean, inheritanceOrTree?: InheritanceOrTree, parentContainerId: string} & ObjectContext> = memo(({iri, isOpen, ...props}) => {
  const {t} = useTranslation("psm");
  const associationContext = props as AssociationContext;
  const objectContext = props as ObjectContext;

  const store = useFederatedObservableStore();
  const {resource} = useResource<DataPsmClass>(iri);
  const readOnly = false;

  const deleteProperty = useCallback(async (partIri: string) =>
    store.executeComplexOperation(new DeleteProperty(iri, partIri)), [iri, store]);

  const localDNDType = ` ${useId()}`;

  const moveToParent = useCallback(async (propertyId: string) => {
    const parent = await store.readResource(props.parentContainerId) as DataPsmClass;
    let thisContainer;
    if (objectContext.contextType === "association") {
      thisContainer = objectContext.parentDataPsmAssociationEndIri;
    } else if (objectContext.contextType === "root") {

    } else if (objectContext.contextType === undefined) {
      thisContainer = iri;
    }
    console.log(parent, thisContainer);
    const index = parent.dataPsmParts.indexOf(thisContainer);

    store.executeComplexOperation(new MoveProperty(iri, propertyId, props.parentContainerId, index));
  }, [store, iri, props.parentDataPsmClassIri, objectContext]);

  const moveUnderNextSibling = useCallback(async (propertyId: string) => {
    if (resource) {
      const nextSiblingId = resource.dataPsmParts[resource.dataPsmParts.indexOf(propertyId) + 1];
      const nextSiblingResource = await store.readResource(nextSiblingId);
      let resourceContainer;
      if (DataPsmAssociationEnd.is(nextSiblingResource)) {
        resourceContainer = nextSiblingResource.dataPsmPart;
      } else if (DataPsmContainer.is(nextSiblingResource)) {
        resourceContainer = nextSiblingId;
      } else {
        throw new Error("Next sibling is not a container or association end.");
      }
      store.executeComplexOperation(new MoveProperty(iri, propertyId, resourceContainer, 0));
    }
  }, [resource, store, iri]);

  return <Collapse in={isOpen} unmountOnExit>
    <Droppable droppableId={iri + localDNDType} type={iri + localDNDType} isDropDisabled={readOnly}>
      {provided =>
        <ul ref={provided.innerRef} {...provided.droppableProps}>
          <TransitionGroup exit={false}>
            {resource?.dataPsmParts?.map((part, index) => part !== props.inheritanceOrTree?.hidePropertyIri ? <Collapse key={part}><Draggable index={index} draggableId={part + localDNDType}>
              {provided =>
                <div ref={provided.innerRef} {...provided.draggableProps}>
                  <DataPsmPropertyType
                      iri={part}
                      dragHandleProps={readOnly ? undefined : provided.dragHandleProps}
                      parentDataPsmClassIri={props.parentDataPsmClassIri}
                      nearestContainerIri={iri}
                      index={index}
                      menu={[
                        <DataPsmDeleteButton onClick={() => deleteProperty(part)} />
                      ]}
                      hiddenMenu={[ close =>
                        <MenuItem onClick={() => {close(); moveToParent(part);}}
                          title={t("button move to parent")}>
                          <ListItemIcon><NorthWestIcon /></ListItemIcon>
                          {t("button move to parent")}
                        </MenuItem>
                      , close =>
                        <MenuItem
                          onClick={() => {close(); moveUnderNextSibling(part);}}
                          title={t("button move under next sibling")}>
                          <ListItemIcon><SouthEastIcon /></ListItemIcon>
                          {t("button move under next sibling")}
                        </MenuItem>
                      ]}
                  />
                </div>
              }
            </Draggable></Collapse> : null)}
            {provided.placeholder}
          </TransitionGroup>
        </ul>
      }
    </Droppable>
    {props.inheritanceOrTree && <ul>
      {props.inheritanceOrTree.children.map(child => <DataPsmSpecializationItem contextType={"or"} parentDataPsmOrIri={(props as ORContext).parentDataPsmOrIri} iri={child.dataPsmObjectIri} inheritanceOrTree={child} />)}
    </ul>}
  </Collapse>;
});

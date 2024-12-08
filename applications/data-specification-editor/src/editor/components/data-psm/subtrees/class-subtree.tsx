import React, {memo, useCallback, useId} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {Collapse} from "@mui/material";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {TransitionGroup} from "react-transition-group";
import {DataPsmPropertyType, ObjectContext, ORContext} from "../data-psm-row";
import {InheritanceOrTree} from "../common/use-inheritance-or";
import {DataPsmSpecializationItem} from "../entities/specialization";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DataPsmDeleteButton} from "../class/DataPsmDeleteButton";
import {DeleteProperty} from "../../../operations/delete-property";

/**
 * Renders class parts (or class in specialization OR) as a subtree.
 *
 * Each property:
 *   1. can be removed by delete button
 *   2. can be moved by drag-and-drop
 */
export const DataPsmClassSubtree: React.FC<{iri: string, parentDataPsmClassIri: string, isOpen: boolean, inheritanceOrTree?: InheritanceOrTree} & ObjectContext> = memo(({iri, isOpen, ...props}) => {
  const store = useFederatedObservableStore();
  const {resource} = useResource<DataPsmClass>(iri);
  const readOnly = false;

  const deleteProperty = useCallback(async (partIri: string) =>
    store.executeComplexOperation(new DeleteProperty(iri, partIri)), [iri, store]);

  const localDNDType = ` ${useId()}`;

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

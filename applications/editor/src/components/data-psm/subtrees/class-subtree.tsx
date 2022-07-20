import React, {memo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {Collapse} from "@mui/material";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {TransitionGroup} from "react-transition-group";
import {DataPsmPropertyType} from "../data-psm-row";
import {InheritanceOrTree} from "../common/use-inheritance-or";
import {DataPsmSpecializationItem} from "../entities/inheritance-tree/specialization";

export const DataPsmClassSubtree: React.FC<{iri: string, isOpen: boolean, inheritanceOrTree?: InheritanceOrTree}> = memo(({iri, isOpen, ...props}) => {
  const {resource} = useResource<DataPsmClass>(iri);
  const readOnly = false;

  return <Collapse in={isOpen} unmountOnExit>
    <Droppable droppableId={iri} type={iri} isDropDisabled={readOnly}>
      {provided =>
        <ul ref={provided.innerRef} {...provided.droppableProps}>
          <TransitionGroup exit={false}>
            {resource?.dataPsmParts?.map((part, index) => <Collapse key={part}><Draggable index={index} draggableId={part}>
              {provided =>
                <div ref={provided.innerRef} {...provided.draggableProps}>
                  {part !== props.inheritanceOrTree?.hidePropertyIri &&
                    <DataPsmPropertyType iri={part} dragHandleProps={readOnly ? undefined : provided.dragHandleProps} parentDataPsmClassIri={iri} index={index} />
                  }
                </div>
              }
            </Draggable></Collapse>)}
            {provided.placeholder}
          </TransitionGroup>
        </ul>
      }
    </Droppable>
    {props.inheritanceOrTree && <ul>
      {props.inheritanceOrTree.children.map(child => <DataPsmSpecializationItem iri={child.dataPsmObjectIri} inheritanceOrTree={child} />)}
    </ul>}
  </Collapse>;
});

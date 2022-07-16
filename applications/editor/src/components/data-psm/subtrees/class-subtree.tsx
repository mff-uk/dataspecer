import React, {memo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {Collapse} from "@mui/material";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {TransitionGroup} from "react-transition-group";
import {DataPsmPropertyType} from "../data-psm-row";

export const DataPsmClassSubtree: React.FC<{iri: string, isOpen: boolean}> = memo(({iri, isOpen}) => {
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
                  <DataPsmPropertyType iri={part} dragHandleProps={readOnly ? undefined : provided.dragHandleProps} parentDataPsmClassIri={iri} index={index} />
                </div>
              }
            </Draggable></Collapse>)}
            {provided.placeholder}
          </TransitionGroup>
        </ul>
      }
    </Droppable>
  </Collapse>;
});

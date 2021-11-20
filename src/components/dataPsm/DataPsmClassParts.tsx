import React, {memo} from "react";
import {Draggable, DraggableProvidedDragHandleProps, Droppable} from "react-beautiful-dnd";
import {DataPsmAttributeItem} from "./DataPsmAttributeItem";
import {Collapse} from "@mui/material";
import {DataPsmAssociationEndItem} from "./DataPsmAssociationEndItem";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import {useResource} from "../../hooks/useResource";

interface DataPsmResourceSwitchProperties {
    dataPsmResourceIri: string,
    dragHandleProps?: DraggableProvidedDragHandleProps;
    parentDataPsmClassIri: string;
    index?: number;
}

/**
 * This component takes an IRI of resource that should be rendered and based of the type it calls the component to
 * render it. During the update, it will remembers the last type to not discard the subtree.
 */
const DataPsmResourceSwitch: React.FC<DataPsmResourceSwitchProperties> = memo((props) => {
    const {resource: dataPsmResource, isLoading} = useResource(props.dataPsmResourceIri);

    if (!dataPsmResource) {
        if (isLoading) {
            return <div {...props.dragHandleProps}>Loading resource...</div>;
        } else {
            return <div {...props.dragHandleProps}>Unable to read resource {props.dataPsmResourceIri}</div>;
        }
    } else if (DataPsmAttribute.is(dataPsmResource)) {
        return <DataPsmAttributeItem {...props}/>;
    } else if (DataPsmAssociationEnd.is(dataPsmResource)) {
        return <DataPsmAssociationEndItem {...props} />;
    } else {
        return <div {...props.dragHandleProps}>Unsupported resource</div>;
    }
});

/**
 * Renders parts (class attributes and class associations) for specified class.
 */
export const DataPsmClassParts: React.FC<{dataPsmClassIri: string, isOpen: boolean}> = memo(({dataPsmClassIri, isOpen}) => {
    const {resource: dataPsmClass, isLoading} = useResource<DataPsmClass>(dataPsmClassIri);

    return <Collapse in={isOpen} unmountOnExit>
        <Droppable droppableId={dataPsmClassIri} type={dataPsmClassIri}>
            {provided =>
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                    {dataPsmClass?.dataPsmParts?.map((part, index) => <Draggable index={index} key={part} draggableId={part}>
                        {provided =>
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                <DataPsmResourceSwitch dataPsmResourceIri={part} dragHandleProps={provided.dragHandleProps} parentDataPsmClassIri={dataPsmClassIri} index={index}/>
                            </div>
                        }
                    </Draggable>)}
                    {provided.placeholder}
                </ul>
            }
        </Droppable>
    </Collapse>;
});

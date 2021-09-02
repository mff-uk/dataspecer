import React, {memo} from "react";
import {Draggable, DraggableProvidedDragHandleProps, Droppable} from "react-beautiful-dnd";
import {DataPsmAttributeItem} from "./DataPsmAttributeItem";
import {Collapse} from "@material-ui/core";
import {DataPsmAssociationClassItem} from "./DataPsmAssociationClassItem";
import {DataPsmClass, isDataPsmAssociationEnd, isDataPsmAttribute} from "model-driven-data/data-psm/model";
import {useDataPsm} from "../../hooks/useDataPsm";

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
    const {dataPsmResource} = useDataPsm(props.dataPsmResourceIri);

    if (!dataPsmResource) {
        return <div {...props.dragHandleProps}>Error or loading for the first time</div>;
    } else if (isDataPsmAttribute(dataPsmResource)) {
        return <DataPsmAttributeItem {...props}/>;
    } else if (isDataPsmAssociationEnd(dataPsmResource)) {
        return <DataPsmAssociationClassItem {...props} />;
    } else {
        return <div {...props.dragHandleProps}>Unsupported resource</div>;
    }
});

/**
 * Renders parts (class attributes and class associations) for specified class.
 */
export const DataPsmClassParts: React.FC<{dataPsmClassIri: string, isOpen: boolean}> = ({dataPsmClassIri, isOpen}) => {
    const {dataPsmResource: dataPsmClass, isLoading} = useDataPsm<DataPsmClass>(dataPsmClassIri);

    return <Collapse in={true} unmountOnExit>
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
};

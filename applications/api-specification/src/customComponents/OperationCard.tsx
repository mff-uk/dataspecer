import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Switch } from "../components/ui/switch.tsx";
import { Card } from '../components/ui/card';
import OperationTypeSelect from '../customComponents/OperationTypeSelect';
import OperationNameInput from '../customComponents/OperationNameInput';
import EndpointInput from '../customComponents/EndpointInput';
import CommentInput from '../customComponents/CommentInput';
import StatusCodeSelect from './HttpStatusCode';
import Association from '../customComponents/IsAssociationSwitch.tsx';
import IsCollection from '../customComponents/IsCollectionSwitch.tsx';
import { DataStructure } from '@/Models/DataStructureModel.tsx';
import { OperationCardProps } from '@/Props/OperationCardProps.tsx';

/* OperationCard - react functional component 
 * The values provided through this component ara utilized for
 * paths and their respective operation construct generation in the resulting OpenAPI specification
 */
const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, setValue, selectedDataStructure, fetchedDataStructures, getValues, defaultValue }) => {

    const [selectedResponseObject, setSelectedResponseObject] = useState(null);
    const [responseObjectFields, setResponseObjectFields] = useState([]);
    const [isCollection, setIsCollection] = useState(false);
    const [associationModeOn, setAssotiationMode] = useState(false);

    const deleteButtonRef = useRef(null);

    /* updates form value corresponding to the target data structure (in case it exists) */
    useEffect(() => {
        try {
            const path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
            setValue(path, selectedResponseObject ? selectedResponseObject.name : '');
        }
        catch
        {
            console.log("Values could not be set")
        }
    }, [selectedResponseObject, setValue, index, operationIndex]);

    return (
        <div key={operationIndex}>
            <Card className="p-2">
                {/* Operation ID and Delete button */}
                <div className='flex w-full justify-between p-2'>
                    <div>
                        <h2>Operation ID: {operationIndex}</h2>
                    </div>
                    <div>
                        <Button
                            ref={deleteButtonRef}
                            className="bg-red-500 hover:bg-red-400"
                            type="button"
                            onClick={() => removeOperation(index, operationIndex)}
                        >
                            Delete Operation
                        </Button>
                    </div>
                </div>
                {/* Operation Details */}
                <Card className="p-2 justify-end">
                    {/* Association Mode - whether targed data structure is a ds one level below the main ds*/}
                    <Association
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        setValue={setValue}
                        getValues={getValues}
                        dataStructureName={selectedDataStructure}
                        dataStructures={fetchedDataStructures}
                        setSelectedResponseObject={setSelectedResponseObject}
                        setResponseObjectFields={setResponseObjectFields}
                        setAssociationModeOn={setAssotiationMode}
                        defaultValue={defaultValue} />
                    {/* Collection mode - whether a collection is manipulated*/}
                    <IsCollection
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        setValue={setValue}
                        getValues={getValues}
                        dataStructureName={selectedDataStructure}
                        dataStructures={fetchedDataStructures}
                        setIsCollection={setIsCollection}
                    />
                    {/* Operation Name - operationId in the generated OAS*/}
                    <OperationNameInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                    />
                    {/* Operation Type */}
                    <OperationTypeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructure={selectedDataStructure}
                        allDataStructures={fetchedDataStructures}
                        setValue={setValue}
                        getValues={getValues}
                        responseObjectFields={responseObjectFields}
                        selectedResponseObject={selectedResponseObject}
                        isCollection={isCollection}
                        associationModeOn={associationModeOn}
                    />
                    {/* Endpoint (path)*/}
                    <EndpointInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructureName={selectedDataStructure}
                    />
                    {/* Comment - mapped to summary in the resulting OAS*/}
                    <CommentInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}

                    />
                    {/* HTTP status code */}
                    <StatusCodeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                    />
                </Card>
            </Card>
        </div>
    );
};

export default OperationCard;

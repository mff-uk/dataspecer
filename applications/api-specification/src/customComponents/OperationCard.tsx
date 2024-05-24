import React, { useEffect, useState } from 'react';
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

const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, setValue, baseUrl, selectedDataStructure, fetchedDataStructures, getValues, defaultValue }) => {

    const [selectedResponseObject, setSelectedResponseObject] = useState(null);
    const [responseObjectFields, setResponseObjectFields] = useState([]);
    const [isCollection, setIsCollection] = useState(false);
    const [associationModeOn, setAssotiationMode] = useState(false);

    useEffect(() => {
        const path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
        const savedValue = getValues(path);
    }, [getValues, index, operationIndex]);

    useEffect(() => {
        try {
            const path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
            setValue(path, selectedResponseObject ? selectedResponseObject.name : '');
        }
        catch
        {
            //console.log("ANASTASIA")
        }
    }, [selectedResponseObject, setValue, index, operationIndex]);

    useEffect(() => {
        
        const currentOperations = getValues(`dataStructures.${index}.operations`);
        const newOperation = getValues(`dataStructures.${index}.operations.${operationIndex}`);

        try
        {
            const isDuplicate = (operation, operations) => {
                return operations.some((op, idx) => idx !== operationIndex && op.oEndpoint === operation.oEndpoint && op.oType === operation.oType);
            };
    
            if (isDuplicate(newOperation, currentOperations)) {
                alert('The last operation is a duplicate.\n OpenAPI does not accept duplicate operations.\n Your operation will be removed');
                removeOperation(index, operationIndex); 
            }
        }
        catch
        {
            console.log("Duplicate removed")
        }
        


    }, [getValues, index, operationIndex, removeOperation]);


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
                            className="bg-red-500 hover:bg-red-400"
                            type="button"
                            onClick={() => removeOperation(index, operationIndex)}
                        >
                            Delete Operation
                        </Button>
                    </div>
                </div>
                {/* Form fields for operation details */}
                <Card className="p-2 justify-end">
                    {/* Association Mode*/}
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
                    {/* Switch to treat Resource as a collection*/}
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
                    {/* Operation Name */}
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
                    {/* Endpoint */}
                    <EndpointInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructureName={selectedDataStructure}
                        baseUrl={baseUrl} />
                    {/* Comment */}
                    <CommentInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}

                    />

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

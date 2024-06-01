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

const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, setValue, selectedDataStructure, fetchedDataStructures, getValues, defaultValue }) => {

    const [selectedResponseObject, setSelectedResponseObject] = useState(null);
    const [responseObjectFields, setResponseObjectFields] = useState([]);
    const [isCollection, setIsCollection] = useState(false);
    const [associationModeOn, setAssotiationMode] = useState(false);

    useEffect(() => {
        const path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
        const savedValue = getValues(path);
    }, [getValues, index, operationIndex]);

    const deleteButtonRef = useRef(null);

    useEffect(() => {
        try {
            const path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
            setValue(path, selectedResponseObject ? selectedResponseObject.name : '');
        }
        catch
        {
            //console.log("")
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
                    />
                    {/* Comment */}
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

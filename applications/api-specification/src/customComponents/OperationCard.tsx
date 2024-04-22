import React from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import OperationTypeSelect from '../customComponents/OperationTypeSelect';
import OperationNameInput from '../customComponents/OperationNameInput';
import EndpointInput from '../customComponents/EndpointInput';
import CommentInput from '../customComponents/CommentInput';
import StatusCodeSelect from './HttpStatusCode';
import RequestBodyComponent from './RequestBodyComponent';
import DataStructuresSelect from './DataStructSelect';
//import ResponseObjectComponent from './ResponseObjectSelect';

interface OperationCardProps {
    operationIndex: number;
    removeOperation: (index: number, operationIndex: number) => void;
    index: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
    baseUrl: string;
    selectedDataStructure: string;
    fetchedDataStructures: DataStructure[]
}

const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, collectionLogicEnabled, singleResourceLogicEnabled, baseUrl, selectedDataStructure, fetchedDataStructures }) => {
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
                <Card className="p-5">
                    {/* Operation Type */}
                    <OperationTypeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* Operation Name */}
                    <OperationNameInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* Endpoint */}
                    <EndpointInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                        dataStructureName={selectedDataStructure}
                        baseUrl={baseUrl} />
                    {/* Comment */}
                    <CommentInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />
                    {/* Comment */}
                    <RequestBodyComponent
                        dataStructure={selectedDataStructure}
                        allDataStructures={fetchedDataStructures}
                        operationIndex={operationIndex}
                        index={index}
                        register={register} />
                    {/* Http StatusCode */}
                    <StatusCodeSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled={collectionLogicEnabled}
                        singleResourceLogicEnabled={singleResourceLogicEnabled}
                    />

                    {/* <ResponseObjectComponent
                        index={index}
                        register={register}
                        dataStructures={fetchedDataStructures}
                        onChange={(selectedDataStructure) => {
                            register(`dataStructures.${index}.name`).onChange({
                                target: {
                                    value: selectedDataStructure.name,
                                },
                            });
                        }}
                    /> */}
                </Card>
            </Card>
        </div>
    );
};

export default OperationCard;

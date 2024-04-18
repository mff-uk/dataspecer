import React from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import OperationTypeSelect from '../customComponents/OperationTypeSelect';
import OperationNameInput from '../customComponents/OperationNameInput';
import EndpointInput from '../customComponents/EndpointInput';
import CommentInput from '../customComponents/CommentInput';

interface OperationCardProps {
    operationIndex: number;
    removeOperation: (index: number, operationIndex: number) => void;
    index: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
}

const OperationCard: React.FC<OperationCardProps> = ({ operationIndex, removeOperation, index, register, collectionLogicEnabled,  singleResourceLogicEnabled}) => {
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
                        collectionLogicEnabled = {collectionLogicEnabled}
                        singleResourceLogicEnabled = {singleResourceLogicEnabled}
                    />
                    {/* Operation Name */}
                    <OperationNameInput
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled = {collectionLogicEnabled}
                        singleResourceLogicEnabled = {singleResourceLogicEnabled}
                    />
                    {/* Endpoint */}
                    <EndpointInput 
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled = {collectionLogicEnabled}
                        singleResourceLogicEnabled = {singleResourceLogicEnabled}
                         />
                    {/* Comment */}
                    <CommentInput 
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        collectionLogicEnabled = {collectionLogicEnabled}
                        singleResourceLogicEnabled = {singleResourceLogicEnabled}
                        />
                </Card>
            </Card>
        </div>
    );
};

export default OperationCard;

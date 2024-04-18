import React from 'react';
import { Input } from '../components/ui/input';

/* 
 * Props which are passed to the functional component -  EndpointInput
 * index - represents index of the comment
 * operationIndex - index of the associated operation
 * register - connection with react-hook-forms
 */
interface EndpointInputProps 
{
    index: number;
    operationIndex: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
}

/* EndpointInput - react functional component */
const EndpointInput: React.FC<EndpointInputProps> = ({ index, operationIndex, register,  collectionLogicEnabled, singleResourceLogicEnabled}) => 
{
    let path = '';

    if (collectionLogicEnabled) 
    {
        path = `dataStructures.${index}.collectionOperations.${operationIndex}.oEndpoint`;
    } 
    else if (singleResourceLogicEnabled) 
    {
        path = `dataStructures.${index}.singleResOperation.${operationIndex}.oEndpoint`;
    }
    
    return (
        <div className = "p-1 flex items-center">
            <label htmlFor = {`endpoint_${index}_${operationIndex}`}>Endpoint:</label>
            <Input
                id = {`endpoint_${index}_${operationIndex}`}
                placeholder = "Write your endpoint here"
                {...register(path)}
            />
        </div>
    );
};

export default EndpointInput;

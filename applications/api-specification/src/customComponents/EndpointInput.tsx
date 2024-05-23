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
    // collectionLogicEnabled: boolean;
    // singleResourceLogicEnabled: boolean;
    dataStructureName: string;
    baseUrl: string;
}

/* EndpointInput - react functional component */
const EndpointInput: React.FC<EndpointInputProps> = ({ index, operationIndex, register, dataStructureName, baseUrl}) => 
{
    //let path = '';
    //let defaultValue = '';

    // if (collectionLogicEnabled) 
    // {
    //     path = `dataStructures.${index}.collectionOperations.${operationIndex}.oEndpoint`;
    //     defaultValue = baseUrl + "/" + dataStructureName + "s";

    // } 
    // else if (singleResourceLogicEnabled) 
    // {
    //     path = `dataStructures.${index}.singleResOperation.${operationIndex}.oEndpoint`;
    //     defaultValue = baseUrl + "/" + dataStructureName + "/" + "{id}";
    // }
    // else
    // {
        const path = `dataStructures.${index}.operations.${operationIndex}.oEndpoint`;
    //}
    
    return (
        <div className = "p-1 flex items-center">
            <label htmlFor = {`endpoint_${index}_${operationIndex}`}>Endpoint:</label>
            <Input
                id = {`endpoint_${index}_${operationIndex}`}
                //defaultValue = {defaultValue}
                //placeholder = {defaultValue}
                {...register(path)}
            />
        </div>
    );
};

export default EndpointInput;

import React from 'react';
import { Input } from '../components/ui/input';

/* 
 * Props which are passed to the functional component -  EndpointInput
 * index - represents index of the selected data structure
 * operationIndex - index of the associated operation
 * register - connection with react-hook-forms
 */
interface EndpointInputProps 
{
    index: number;
    operationIndex: number;
    register: any;
    dataStructureName: string;
    baseUrl: string;
}

/* EndpointInput - react functional component */
const EndpointInput: React.FC<EndpointInputProps> = ({ index, operationIndex, register, dataStructureName, baseUrl}) => 
{
    const path = `dataStructures.${index}.operations.${operationIndex}.oEndpoint`;

    return (
        <div className = "p-1 flex items-center">
            <label htmlFor = {`endpoint_${index}_${operationIndex}`}>Endpoint:</label>
            <Input
                id = {`endpoint_${index}_${operationIndex}`}
                {...register(path)}
            />
        </div>
    );
};

export default EndpointInput;

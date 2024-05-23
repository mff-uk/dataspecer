import React from 'react';
import { Input } from '../components/ui/input';
import { EndpointInputProps } from '../Models/EndpointInputProps';

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

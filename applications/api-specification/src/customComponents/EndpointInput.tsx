import React from 'react';
import { Input } from '../components/ui/input';
import { EndpointInputProps } from '../Props/EndpointInputProps';

/* EndpointInput - react functional component 
 * the value of this component is mapped to the path
 * in the generated OpenAPI specification
 */

const EndpointInput: React.FC<EndpointInputProps> = ({ index, operationIndex, register }) => {

    const path = `dataStructures.${index}.operations.${operationIndex}.oEndpoint`;

    return (
        <div className="p-1 flex items-center">
            <label htmlFor={`endpoint_${index}_${operationIndex}`}>Endpoint:</label>
            <Input
                id={`endpoint_${index}_${operationIndex}`}
                placeholder="Paste the suggested path here"
                {...register(path)}
            />
        </div>
    );
};

export default EndpointInput;

import React from 'react';
import { Input } from '../components/ui/input';
import { OperationNameInputProps } from '../Props/OperationNameInputProps';

/* OperationNameInput - react functional component
 * The value of this component is mapped to operationId in the resulting OpenAPI specificaiton
 */
const OperationNameInput: React.FC<OperationNameInputProps> = ({ index, operationIndex, register }) => {

    const inputId = `operationName_${index}_${operationIndex}`
    const placeHolder = "Enter Operation Name. Example: GetResourceName"

    const path = `dataStructures.${index}.operations.${operationIndex}.oName`;

    return (
        <div className="p-1 flex items-center">
            <label className="mr-2" htmlFor={inputId}>Operation Name:</label>
            <Input
                id={inputId}
                placeholder={placeHolder}
                {...register(path)}
            />
        </div>
    );
};

export default OperationNameInput;


import React from 'react';
import { Input } from '../components/ui/input';
import {OperationNameInputProps} from '../Props/OperationNameInputProps';



const OperationNameInput: React.FC<OperationNameInputProps> = ({ index, operationIndex, register }) => {
        
        const inputId = `operationName_${index}_${operationIndex}`
        const inputPlaceholder = "Enter Operation Name. Example: GetResourceName"
        
        const path = `dataStructures.${index}.operations.${operationIndex}.oName`;

        return (
            <div className="p-1 flex items-center">
                <label className="mr-2" htmlFor={inputId}>Operation Name:</label>
                <Input
                    id={inputId}
                    placeholder={inputPlaceholder}
                    {...register(path)}
                />
            </div>
        );
};

export default OperationNameInput;


import React from 'react';
import { Input } from '../components/ui/input';

// TODO: instead of this component use LabeledInput
interface OperationNameInputProps 
{
    index: number;
    operationIndex: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
}

// const OperationNameInput: React.FC<OperationNameInputProps> = ({ index, operationIndex, register, collectionLogicEnabled, singleResourceLogicEnabled }) => 
// {
//     if(collectionLogicEnabled)
//     {
//         return (
        
//             <div className="p-1 flex items-center">
//                 <label className="mr-2" htmlFor={`operationName_${index}_${operationIndex}`}>Operation Name:</label>
//                 <Input
//                     id={`operationName_${index}_${operationIndex}`}
//                     placeholder="Enter Operation Name"
//                     {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oName`)}
//                 />
//             </div>
//         );
//     }
//     else if(singleResourceLogicEnabled)
//     {
//         return (
        
//             <div className="p-1 flex items-center">
//                 <label className="mr-2" htmlFor={`operationName_${index}_${operationIndex}`}>Operation Name:</label>
//                 <Input
//                     id={`operationName_${index}_${operationIndex}`}
//                     placeholder="Enter Operation Name"
//                     {...register(`dataStructures.${index}.singleResOperation.${operationIndex}.oName`)}
//                 />
//             </div>
//         );
//     }
    
// };

const OperationNameInput: React.FC<OperationNameInputProps> = ({ index, operationIndex, register, collectionLogicEnabled, singleResourceLogicEnabled }) => {

    //if (collectionLogicEnabled || singleResourceLogicEnabled) {
        
        const inputId = `operationName_${index}_${operationIndex}`
        const inputPlaceholder = "Enter Operation Name"
        
        let path = ''
        
        if (collectionLogicEnabled) 
        {
            path = `dataStructures.${index}.collectionOperations.${operationIndex}.oName`;
        } 
        else if (singleResourceLogicEnabled) 
        {
            path = `dataStructures.${index}.singleResOperation.${operationIndex}.oName`;
        }
        else
        {
            path = `dataStructures.${index}.operations.${operationIndex}.oName`;
        }

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
    // } else {
    //     return null;
    // }
};

export default OperationNameInput;


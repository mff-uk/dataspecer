import React from 'react';

interface OperationType {
    value: string;
    label: string;
}

/* Predefined http methods */
const httpMethods: OperationType[] =
    [
        { value: 'GET', label: 'GET' }, // retrieve data
        { value: 'POST', label: 'POST' }, // create new instance 
        { value: 'PUT', label: 'PUT' }, // update instance - particular fields/properties
        { value: 'PATCH', label: 'PATCH' }, // update WHOLE instance
        { value: 'DELETE', label: 'DELETE' }, // delete instance
    ];

/*
 * Props which are passed to the functional component -  OperationTypeSelect
 */
interface OperationTypeSelectProps {
    index: number;
    operationIndex: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
}

const OperationTypeSelect: React.FC<OperationTypeSelectProps> = ({ index, operationIndex, register, collectionLogicEnabled, singleResourceLogicEnabled }) => {
    
    
    let path = ''
        
        if (collectionLogicEnabled) 
        {
            path = `dataStructures.${index}.collectionOperations.${operationIndex}.oType`;
        } 
        else if (singleResourceLogicEnabled) 
        {
            path = `dataStructures.${index}.singleResOperation.${operationIndex}.oType`;
        }
        else
        {
            path = `dataStructures.${index}.operations.${operationIndex}.oType`;
        }

    // return (
    //     <>
    //         {/* Operation Type Label*/}
    //         <label htmlFor = {`operationType_${index}_${operationIndex}`}>
    //             Operation Type:
    //             </label>
    //         <select
    //             id = {`operationType_${index}_${operationIndex}`}
    //             {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oType`)}
    //             required>
    //             <option value = "">
    //                 Select Operation Type
    //                 </option>
    //             {/* Render options in the component - GET, POST, PUT, PATCH, DELETE */}
    //             {httpMethods.map(httpMethod => (
    //                 <option key = {httpMethod.value} value = {httpMethod.value}>
    //                     {httpMethod.label}
    //                 </option>
    //             ))}
    //         </select>
    //     </>
    // );

    //if (collectionLogicEnabled || singleResourceLogicEnabled) {
        return (
            <>
                {/* Operation Type Label*/}
                <label htmlFor={`operationType_${index}_${operationIndex}`}>
                    Operation Type:
                </label>
                <select
                    id={`operationType_${index}_${operationIndex}`}
                    {...register(path)}
                    required
                >
                    <option value="">
                        Select Operation Type
                    </option>
                    {/* Render options in the component - GET, POST, PUT, PATCH, DELETE */}
                    {httpMethods.map(httpMethod => (
                        <option key={httpMethod.value} value={httpMethod.value}>
                            {httpMethod.label}
                        </option>
                    ))}
                </select>
            </>
        );
    // } else {
    //     return null;
    // }
};

export default OperationTypeSelect;

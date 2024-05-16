import React from 'react';

interface StatusCode {
    value: string;
    label: string;
    message: string;
}

/* Predefined http methods */
const httpStatusCodes: StatusCode[] =
    [
        { value: '200', label: '200 - successful request', message: 'successful request' }, 
        { value: '201', label: '201 - new resource created', message: 'new resource created' }, 
        { value: '204', label: '204 - success with no content tu return', message: 'success with no content tu return' }, 
        { value: '400', label: '400 - bad request', message: 'bad request' }, 
        { value: '401', label: '401 - unauthorised', message: 'unauthorised' },
        { value: '500', label: '500 - internal server error', message: 'internal server error' },  
    ];

/*
 * Props which are passed to the functional component -  OperationTypeSelect
 */
interface StatusCodeSelectProps {
    index: number;
    operationIndex: number;
    register: any;
    collectionLogicEnabled: boolean;
    singleResourceLogicEnabled: boolean;
}

const StatusCodeSelect: React.FC<StatusCodeSelectProps> = ({ index, operationIndex, register, collectionLogicEnabled, singleResourceLogicEnabled }) => {
    
    let path = ''
        
        if (collectionLogicEnabled) 
        {
            path = `dataStructures.${index}.collectionOperations.${operationIndex}.oResponse`;
        } 
        else if (singleResourceLogicEnabled) 
        {
            path = `dataStructures.${index}.singleResOperation.${operationIndex}.oResponse`;
        }
        else
        {
            path = `dataStructures.${index}.operations.${operationIndex}.oResponse`;
        }

        return (
            <>
                {/* Operation Type Label*/}
                <label htmlFor={`operationType_${index}_${operationIndex}`}>
                    Response code:
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
                    {httpStatusCodes.map(httpMethod => (
                        <option key={httpMethod.value} value={httpMethod.value}>
                            {httpMethod.label}
                        </option>
                    ))}
                </select>
            </>
        );
};

export default StatusCodeSelect;

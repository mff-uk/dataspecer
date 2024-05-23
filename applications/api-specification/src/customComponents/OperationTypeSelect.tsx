import React, { useEffect, useState } from 'react';
import RequestBodyComponent from './RequestBodyComponent';
import pluralize from 'pluralize';
import { OperationTypeSelectProps } from '@/Props/OperationTypeSelectProps';
import { DataStructure } from '@/Models/DataStructureModel';

interface OperationType {
    value: string;
    label: string;
}

const pluralizeAndNoSpaces = (word: string): string => {
    const pluralWord = pluralize(word);
    return pluralWord.replace(/\s+/g, '');
};

// Predefined http methods based on isCollection state
const collectionHttpMethods: OperationType[] = [
    { value: 'GET', label: 'GET - Retrieve a list of resources within the collection' },
    { value: 'POST', label: 'POST - Create a new resource within the collection' },
];

const singleResourceHttpMethods: OperationType[] = [
    { value: 'GET', label: 'GET - Retrieve the specific entity' },
    { value: 'PUT', label: 'PUT - Full replacement of the entity' },
    { value: 'PATCH', label: 'PATCH - Partially update existing entity' },
    { value: 'DELETE', label: 'DELETE - Remove the specific entity' },
];

const OperationTypeSelect: React.FC<OperationTypeSelectProps> = ({
    index,
    operationIndex,
    getValues,
    register,
    setValue,
    dataStructure,
    allDataStructures,
    responseObjectFields,
    selectedResponseObject,
    isCollection,
    associationModeOn

}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oType`;

    const [selectedOperationType, setSelectedOperationType] = useState('');

    
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedOperationType(selectedValue);
    };

    useEffect(() => {
        const currentValue = getValues(path);
        if (currentValue && selectedOperationType === '') {
            setSelectedOperationType(currentValue);
        }

    }, [path, getValues, selectedOperationType]);
    
    

    const availableHttpMethods = isCollection ? collectionHttpMethods : singleResourceHttpMethods;
    return (
        <>
            {/* Operation Type Label */}
            <label htmlFor={`operationType_${index}_${operationIndex}`}>
                Operation Type:
            </label>
            <select
                className="p-2"
                id={`operationType_${index}_${operationIndex}`}
                {...register(path)}
                required
                onChange={handleChange}
                value={selectedOperationType}
            >
                <option value="">
                    Select Operation Type
                </option>
                {/* Render available options based on isCollection state */}
                {availableHttpMethods.map(httpMethod => (
                    <option key={httpMethod.value} value={httpMethod.value}>
                        {httpMethod.label}
                    </option>
                ))}
            </select>

            {
                dataStructure && isCollection && associationModeOn && selectedResponseObject ? (
                    <div>
                        {/* <h2>Association mode combined with collection</h2> */}
                        <p>Suggested Path: {pluralizeAndNoSpaces(dataStructure)}/{`{id}`}/{pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}</p>
                    </div>
                ) : dataStructure && !isCollection && associationModeOn && selectedResponseObject ? (
                    <div>
                        {/* <h2>Association mode combined with singleton</h2> */}
                        <p>Suggested Path: {pluralizeAndNoSpaces(dataStructure)}/{`{id}`}/{pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}/{`{id}`}</p>
                    </div>

                ) : dataStructure && isCollection && !associationModeOn ? (
                    
                    <div>
                        {/* <h2>Collection with main data structure</h2> */ }
                        <p> Suggested Path: {pluralizeAndNoSpaces(dataStructure)} </p>
                    </div>
                ) : dataStructure && !isCollection && !associationModeOn ? (
                    <div>
                        {/* <h2>Singleton with main data structure</h2> */ }
                        <p> Suggested Path: {pluralizeAndNoSpaces(dataStructure)}/{`{id}`} </p>
                    </div>
                    
                ) : (
                    <h2>Default case</h2>
                )
            }

            {/* Request Body Component */}
            {(isCollection && selectedOperationType === 'POST') ||
                (!isCollection && selectedOperationType === 'PATCH') ? (
                <RequestBodyComponent
                    index={index}
                    operationIndex={operationIndex}
                    register={register}
                    setValue={setValue}
                    getValues = {getValues}
                    dataStructure={selectedResponseObject && associationModeOn ? selectedResponseObject : dataStructure}
                    allDataStructures={allDataStructures}
                    responseDataStructures={responseObjectFields}
                    associationModeOn={associationModeOn}
                />
            ) : null}
        </>
    );
};

export default OperationTypeSelect;

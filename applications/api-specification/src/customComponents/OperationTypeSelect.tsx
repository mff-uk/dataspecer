import React, { useEffect, useState } from 'react';
import RequestBodyComponent from './RequestBodyComponent';
import pluralize from 'pluralize';
import { OperationTypeSelectProps } from '@/Props/OperationTypeSelectProps';
import { DataStructure } from '@/Models/DataStructureModel';
import { OperationType } from '../Models/OperationTypeModel.tsx';

/* gets plural of the words - utilized for suggested path generation */
const pluralizeAndNoSpaces = (word: string): string => {
    const pluralWord = pluralize(word);
    return pluralWord.replace(/\s+/g, '');
};

/* Predefined HTTP methods for collection manipulations */
const collectionHttpMethods: OperationType[] = [
    { value: 'GET', label: 'GET - Retrieve a collection of resources' },
    { value: 'POST', label: 'POST - Create a new resource within the collection' },
];

/* Predefined HTTP methods for single resource manipulations */
const singleResourceHttpMethods: OperationType[] = [
    { value: 'GET', label: 'GET - Retrieve the specific entity' },
    { value: 'PUT', label: 'PUT - Full replacement of the entity' },
    { value: 'PATCH', label: 'PATCH - Partially update existing entity' },
    { value: 'DELETE', label: 'DELETE - Remove the specific entity' },
];

/* OperationTypeSelect - react functional component for selecting operation type */
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


    /* copies string to clipboard
     * utilized for copying the suggested path 
     */
    const copyStrToClipboard = (str) => {
        navigator.clipboard.writeText(str).then(
            () => {
                alert('Suggested path was copied to clipboard');
            },
            (err) => {
                console.error('Suggested path could not be copied. Error: ', err);
            }
        );
    };

    /* generates suggested path*/
    const generateSuggestedPath = (dataStructure, isCollection, associationModeOn, selectedResponseObject) => {

        let suggestedPath = '';

        if (dataStructure && isCollection && associationModeOn && selectedResponseObject) {
            suggestedPath = `/${pluralizeAndNoSpaces(dataStructure)}/{id}/${pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}`;
        }
        else if (dataStructure && !isCollection && associationModeOn && selectedResponseObject) {
            suggestedPath = `/${pluralizeAndNoSpaces(dataStructure)}/{id}/${pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}/{id}`;
        }
        else if (dataStructure && isCollection && !associationModeOn) {
            suggestedPath = `/${pluralizeAndNoSpaces(dataStructure)}`;
        }
        else if (dataStructure && !isCollection && !associationModeOn) {
            suggestedPath = `/${pluralizeAndNoSpaces(dataStructure)}/{id}`;
        }

        return suggestedPath;
    }

    const suggestedPath = generateSuggestedPath(dataStructure, isCollection, associationModeOn, selectedResponseObject)
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
                {/* Rendering available options based on the state of isCollection */}
                {availableHttpMethods.map(httpMethod => (
                    <option key={httpMethod.value} value={httpMethod.value}>
                        {httpMethod.label}
                    </option>
                ))}
            </select>

            {/* Rendering Request Body Component if needed  */}
            {(isCollection && selectedOperationType === 'POST') ||
                (!isCollection && selectedOperationType === 'PATCH') ? (
                <RequestBodyComponent
                    index={index}
                    operationIndex={operationIndex}
                    register={register}
                    setValue={setValue}
                    getValues={getValues}
                    dataStructure={selectedResponseObject && associationModeOn ? selectedResponseObject : dataStructure}
                    allDataStructures={allDataStructures}
                    responseDataStructures={responseObjectFields}
                    associationModeOn={associationModeOn}
                />
            ) : null}

            {suggestedPath && (
                <div className="flex items-center">
                    <p>Suggested Path: {suggestedPath}</p>
                    <button
                        className="ml-2 p-1 bg-blue-500 text-white rounded"
                        onClick={() => copyStrToClipboard(suggestedPath)}
                    >
                        copy
                    </button>
                </div>
            )}
        </>
    );
};

export default OperationTypeSelect;

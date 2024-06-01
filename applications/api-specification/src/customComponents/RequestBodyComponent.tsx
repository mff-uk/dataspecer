import React, { useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { DataStructure, Field as DataField } from '@/Models/DataStructureModel';
import { RequestBodyProps } from '@/Props/RequestBodyProps';

const handleCheckboxChange = (fieldPath, checked, setValue) => {
    setValue(fieldPath, checked);
};

const RequestBodyComponent: React.FC<RequestBodyProps> = ({
    index,
    operationIndex,
    dataStructure,
    //register,
    setValue,
    allDataStructures,
    responseDataStructures,
    associationModeOn,
    getValues
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;

    useEffect(() => {
        const requestBodyValues = getValues(path);
        setValue(path, requestBodyValues);
    }, []);

    let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);

    let responseDataStructure;

    if (responseDataStructures) {
        responseDataStructure = responseDataStructures?.find((ds) => ds.name === (dataStructure as unknown as DataStructure).name);
    }

    if (associationModeOn && responseDataStructure && responseDataStructure.fields) {
        return (
            <div key={operationIndex}>
                <Card className="p-2">
                    <h3>Request Body</h3>
                    {responseDataStructure.fields.map((field) => (
                        <div key={field.name}>
                            <Checkbox
                                id={`${path}.${field.name}`}
                                checked={getValues(`${path}.${field.name}`)}
                                onCheckedChange={(checked) => handleCheckboxChange(`${path}.${field.name}`, checked, setValue)}
                            />

                            <label htmlFor={`${path}.${field.name}`}>
                                {field.name}
                            </label>
                        </div>
                    ))}
                </Card>
            </div>
        );
    }

    if (!associationModeOn && targetDataStructure) {
        return (
            <div key={operationIndex}>
                <Card className="p-2">
                    <h3>Request Body</h3>
                    {targetDataStructure.fields.map((field) => (
                        <div key={field.name}>
                            <Checkbox
                                id={`${path}.${field.name}`}
                                checked={getValues(`${path}.${field.name}`)} // Use getValues to retrieve the current value
                                onCheckedChange={(checked) => handleCheckboxChange(`${path}.${field.name}`, checked, setValue)}
                            />

                            <label htmlFor={`${path}.${field.name}`}>
                                {field.name}
                            </label>
                        </div>
                    ))}
                </Card>
            </div>
        );
    }
    else {
        return <div>Error: Data structure not found</div>;
    }
};

export default RequestBodyComponent;



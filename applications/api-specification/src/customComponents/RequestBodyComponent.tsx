import React, { useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { DataStructure, Field as DataField } from '@/Models/DataStructureModel';
import { RequestBodyProps } from '@/Props/RequestBodyProps';

const handleCheckboxChange = (fieldPath, checked, setValue) => {
    setValue(fieldPath, checked);
};

/* RequestBodyComponent - react functional component 
 * utilized for request body section of the operation object in the generated OAS
 */
const RequestBodyComponent: React.FC<RequestBodyProps> = ({
    index,
    operationIndex,
    dataStructure,
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

    // Main data structure - finding based on the given name
    let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);

    let responseDataStructure;

    // data structure one level below the main data structure
    if (responseDataStructures) {
        responseDataStructure = responseDataStructures?.find((ds) => ds.name === (dataStructure as unknown as DataStructure).name);
    }

    /* Request body component corresponding to associationMode - ON */
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

    /* Request body component corresponding to associationMode - OFF */
    if (!associationModeOn && targetDataStructure) {
        return (
            <div key={operationIndex}>
                <Card className="p-2">
                    <h3>Request Body</h3>
                    {targetDataStructure.fields.map((field) => (
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
    else {
        return <div>Error: Data structure not found</div>;
    }
};

export default RequestBodyComponent;



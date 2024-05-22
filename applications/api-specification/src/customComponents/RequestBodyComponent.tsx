import React from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { DataStructure, Field as DataField} from '@/Models/DataStructureNex';

interface RequestBodyProps {
    index: number;
    operationIndex: number;
    dataStructure: string;
    register: any;
    setValue: any;
    allDataStructures?: DataStructure[];
    responseDataStructures?: DataStructure[];
    associationModeOn: boolean
}

const handleCheckboxChange = (fieldPath, checked, setValue) => {
    setValue(fieldPath, checked);
};

const RequestBodyComponent: React.FC<RequestBodyProps> = ({
    index,
    operationIndex,
    dataStructure,
    register,
    setValue,
    allDataStructures,
    responseDataStructures, 
    associationModeOn
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;

    let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);

    //console.log(dataStructure)
    //console.log("targetDataStructure is " + JSON.stringify(targetDataStructure))
    let responseDataStructure;

    //console.log("associationModeOn req body "  + associationModeOn)
    
    if(responseDataStructures)
    {
        responseDataStructure = responseDataStructures?.find((ds) => ds.name === (dataStructure as unknown as DataStructure).givenName);
        //console.log("responseDataStructure is" + JSON.stringify(responseDataStructure))
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
                                checked={register(`${path}.${field.name}`).value}
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
        //console.log('Using targetDataStructure:', JSON.stringify(targetDataStructure));
        return (
            <div key={operationIndex}>
                <Card className="p-2">
                    <h3>Request Body</h3>
                    {targetDataStructure.fields.map((field) => (
                        <div key={field.name}>
                            <Checkbox
                                id={`${path}.${field.name}`}
                                checked={register(`${path}.${field.name}`).value}
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
    else 
    {
        console.log('Error: Data structure not found');
        return <div>Error: Data structure not found</div>;
    }
};

export default RequestBodyComponent;



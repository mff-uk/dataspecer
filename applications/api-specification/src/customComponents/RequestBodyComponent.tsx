import React from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox'; // Assuming you have a Checkbox component in your UI components

interface RequestBodyProps {
    index: number;
    operationIndex: number;
    dataStructure: string;
    register: any;
    allDataStructures?: DataStructure[]

}

const RequestBodyComponent: React.FC<RequestBodyProps> = ({ index, operationIndex, dataStructure, register, allDataStructures }) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;
    const targetDataStructure = allDataStructures.find((ds) => ds.givenName === dataStructure);
    console.log(JSON.stringify(dataStructure))
    console.log(JSON.stringify(targetDataStructure))
    console.log(targetDataStructure)
    return (
        <div key={operationIndex}>
            <Card className="p-2">
                <h3>Request Body</h3>
                {/* Iterate over the properties of the request body object */}
                {Object.keys(targetDataStructure.properties).map((propName) => (
                    <div key={propName}>
                        <Checkbox
                            id={`${path}.${propName}`}
                            {...register(`${path}.${propName}`)}
                        />
                        <label htmlFor={`${path}.${propName}`}>
                            {propName}
                        </label>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default RequestBodyComponent;

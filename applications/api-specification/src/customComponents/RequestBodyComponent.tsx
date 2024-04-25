import React from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox'; // Assuming you have a Checkbox component in your UI components

interface RequestBodyProps {
    index: number;
    operationIndex: number;
    dataStructure: string;
    register: any;
    setsetValue: any;
    allDataStructures?: DataStructure[]

}

// const RequestBodyComponent: React.FC<RequestBodyProps> = ({ index, operationIndex, dataStructure, register, allDataStructures }) => {
//     const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;
//     const targetDataStructure = allDataStructures.find((ds) => ds.givenName === dataStructure);
//     console.log(JSON.stringify(dataStructure))
//     console.log(JSON.stringify(targetDataStructure))
//     console.log("target datastr" + targetDataStructure)
//     return (
//         <div key={operationIndex}>
//             <Card className="p-2">
//                 <h3>Request Body</h3>
//                 {Object.keys(targetDataStructure.fields).map((propName) => (
//                     <div key={propName}>
//                         <Checkbox
//                             id={`${path}.${propName}`}
//                             {...register(`${path}.${propName}`)}
//                         />
//                         <label htmlFor={`${path}.${propName}`}>
//                             {propName.name}
//                         </label>
//                     </div>
//                 ))}
//             </Card>
//         </div>
//     );
// };

const handleCheckboxChange = (fieldPath, checked, setValue) => {
    // Update the form state based on the checkbox's value
    setValue(fieldPath, checked);
};

const RequestBodyComponent: React.FC<RequestBodyProps> = ({ index, operationIndex, dataStructure, register, setValue, allDataStructures }) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;

    // Find the target data structure
    console.log("selected datastructure is: " + JSON.stringify(dataStructure))
    const targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);

    // Check if targetDataStructure is defined
    if (!targetDataStructure) {
        return <div>Error: Data structure not found</div>;
    }

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
};

export default RequestBodyComponent;

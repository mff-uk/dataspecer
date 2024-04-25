// import React from 'react';
// import { Card } from '../components/ui/card';
// import { Checkbox } from '../components/ui/checkbox'; // Assuming you have a Checkbox component in your UI components

// interface RequestBodyProps {
//     index: number;
//     operationIndex: number;
//     dataStructure: string;
//     register: any;
//     setsetValue: any;
//     allDataStructures?: DataStructure[],
//     responseDataStructures? : any
// }


// const handleCheckboxChange = (fieldPath, checked, setValue) => {
//     // Update the form state based on the checkbox's value
//     setValue(fieldPath, checked);
// };

// const RequestBodyComponent: React.FC<RequestBodyProps> = ({ index, operationIndex, dataStructure, register, setValue, allDataStructures, responseDataStructures }) => {
//     const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;
//     let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);
//     let responseDataStructure;
    
//     if (responseDataStructures) {
//         responseDataStructure = responseDataStructures.find((ds) => ds.classType === dataStructure.classType);
//     }

    

    

//     // Check if targetDataStructure is defined
//     if (!targetDataStructure) {
//         return <div>Error: Data structure not found</div>;
//     }

//     return (
//         <div key={operationIndex}>
//             <Card className="p-2">
//                 <h3>Request Body</h3>
//                 {targetDataStructure.fields.map((field) => (
//                     <div key={field.name}>
//                         <Checkbox
//                             id={`${path}.${field.name}`}
//                             checked={register(`${path}.${field.name}`).value}
//                             onCheckedChange={(checked) => handleCheckboxChange(`${path}.${field.name}`, checked, setValue)}
//                         />
//                         <label htmlFor={`${path}.${field.name}`}>
//                             {field.name}
//                         </label>
//                     </div>
//                 ))}
//             </Card>
//         </div>
//     );
// };

// export default RequestBodyComponent;


import React from 'react';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox'; // Assuming you have a Checkbox component in your UI components

interface RequestBodyProps {
    index: number;
    operationIndex: number;
    dataStructure: string;
    register: any;
    setValue: any;
    allDataStructures?: DataStructure[];
    responseDataStructures?: DataStructure[];
}

const handleCheckboxChange = (fieldPath, checked, setValue) => {
    // Update the form state based on the checkbox's value
    setValue(fieldPath, checked);
};

const RequestBodyComponent: React.FC<RequestBodyProps> = ({
    index,
    operationIndex,
    dataStructure,
    register,
    setValue,
    allDataStructures,
    responseDataStructures
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;

    // Find the target data structure
    let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);
    
    // Find the response data structure if it exists
    let responseDataStructure = responseDataStructures?.find((ds) => ds.name === dataStructure.name);

    // Render based on whether responseDataStructure is defined
    if (responseDataStructure && responseDataStructure.nestedFields) {
        // Render nested fields from responseDataStructure
        return (
            <div key={operationIndex}>
                <Card className="p-2">
                    <h3>Request Body</h3>
                    {responseDataStructure.nestedFields.fields.map((field) => (
                        <div key={field.name}>
                            <Checkbox
                                id={`${path}.${field.name}`}
                                //checked={register(`${path}.${field.name}`).value}
                                //onCheckedChange={(checked) => handleCheckboxChange(`${path}.${field.name}`, checked, setValue)}
                            />
                            <label htmlFor={`${path}.${field.name}`}>
                                {field.name}
                            </label>
                        </div>
                    ))}
                </Card>
            </div>
        );
    } else if (targetDataStructure) {
        // Render fields from targetDataStructure
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
    } else {
        // Return an error if neither data structure is found
        return <div>Error: Data structure not found</div>;
    }
};

export default RequestBodyComponent;

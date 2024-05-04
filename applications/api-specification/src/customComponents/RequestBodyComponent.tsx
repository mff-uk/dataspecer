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
    responseDataStructures
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oRequestBody`;

    let targetDataStructure = allDataStructures?.find((ds) => ds.givenName === dataStructure);

    let responseDataStructure;
    
    if(responseDataStructures)
    {
        //responseDataStructure = responseDataStructures?.find((ds) => ds.name === (dataStructure as unknown as DataField).classType);
        responseDataStructure = responseDataStructures?.find((ds) => ds.name === (dataStructure as unknown as DataStructure).givenName);
        console.log("responseDataStructure is" + JSON.stringify(responseDataStructure))
    }

    //console.log('Response Data Structure:', JSON.stringify(responseDataStructure));
    //console.log('Target Data Structure:', JSON.stringify(targetDataStructure));
    //console.log('Data Structure:', JSON.stringify(dataStructure));

    if (responseDataStructure && responseDataStructure.fields) {
        //console.log('Using responseDataStructure:', JSON.stringify(responseDataStructure));
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
    } else if (targetDataStructure) {
        console.log('Using targetDataStructure:', JSON.stringify(targetDataStructure));
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
        console.log('Error: Data structure not found');
        return <div>Error: Data structure not found</div>;
    }
};

export default RequestBodyComponent;



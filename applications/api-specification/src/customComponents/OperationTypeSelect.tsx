// import React, { useState } from 'react';
// import RequestBodyComponent from './RequestBodyComponent';


// interface OperationType {
//     value: string;
//     label: string;
// }

// /* Predefined http methods */
// const httpMethods: OperationType[] =
//     [
//         { value: 'GET', label: 'GET' }, // retrieve data
//         { value: 'POST', label: 'POST' }, // create new instance 
//         { value: 'PUT', label: 'PUT' }, // update instance - particular fields/properties
//         { value: 'PATCH', label: 'PATCH' }, // update WHOLE instance
//         { value: 'DELETE', label: 'DELETE' }, // delete instance
//     ];

// /*
//  * Props which are passed to the functional component -  OperationTypeSelect
//  */
// interface OperationTypeSelectProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: any;
//     // collectionLogicEnabled: boolean;
//     // singleResourceLogicEnabled: boolean;
//     dataStructure: string;
//     allDataStructures: DataStructure[]
//     responseObjectFields?: any;
//     selectedResponseObject?: string;
//     isCollection: boolean

// }

// const OperationTypeSelect: React.FC<OperationTypeSelectProps> = ({ index, operationIndex, register, setValue, dataStructure, allDataStructures, responseObjectFields, selectedResponseObject}) => {


//     // let path = ''

//     // if (collectionLogicEnabled) {
//     //     path = `dataStructures.${index}.collectionOperations.${operationIndex}.oType`;
//     // }
//     // else if (singleResourceLogicEnabled) {
//     //     path = `dataStructures.${index}.singleResOperation.${operationIndex}.oType`;
//     // }
//     // else {
//     //     path = `dataStructures.${index}.operations.${operationIndex}.oType`;
//     // }

//     const path = `dataStructures.${index}.operations.${operationIndex}.oType`;
//     // Local state to track the selected operation type
//     const [selectedOperationType, setSelectedOperationType] = useState('');

//     // Event handler for changing the operation type
//     const handleChange = (event) => {
//         const selectedValue = event.target.value;
//         setSelectedOperationType(selectedValue);
//     };

//     // return (
//     //     <>
//     //         {/* Operation Type Label*/}
//     //         <label htmlFor = {`operationType_${index}_${operationIndex}`}>
//     //             Operation Type:
//     //             </label>
//     //         <select
//     //             id = {`operationType_${index}_${operationIndex}`}
//     //             {...register(`dataStructures.${index}.collectionOperations.${operationIndex}.oType`)}
//     //             required>
//     //             <option value = "">
//     //                 Select Operation Type
//     //                 </option>
//     //             {/* Render options in the component - GET, POST, PUT, PATCH, DELETE */}
//     //             {httpMethods.map(httpMethod => (
//     //                 <option key = {httpMethod.value} value = {httpMethod.value}>
//     //                     {httpMethod.label}
//     //                 </option>
//     //             ))}
//     //         </select>
//     //     </>
//     // );

//     //if (collectionLogicEnabled || singleResourceLogicEnabled) {
//     return (
//         <>
//             {/* Operation Type Label*/}
//             <label htmlFor={`operationType_${index}_${operationIndex}`}>
//                 Operation Type:
//             </label>
//             <select className = "p-2"
//                 id={`operationType_${index}_${operationIndex}`}
//                 {...register(path)}
//                 required
//                 onChange={handleChange}
//             >
//                 <option value="">
//                     Select Operation Type
//                 </option>
//                 {/* Render options in the component - GET, POST, PUT, PATCH, DELETE */}
//                 {httpMethods.map(httpMethod => (
//                     <option key={httpMethod.value} value={httpMethod.value}>
//                         {httpMethod.label}
//                     </option>
//                 ))}
//             </select>

//             {(selectedOperationType === 'POST' || selectedOperationType === 'PUT') && (
//                 <RequestBodyComponent
//                     index={index}
//                     operationIndex={operationIndex}
//                     register={register}
//                     setValue={setValue}
//                     dataStructure={selectedResponseObject ? selectedResponseObject : dataStructure}
//                     //allDataStructures={allDataStructures}
//                     allDataStructures={allDataStructures}
//                     responseDataStructures = {responseObjectFields}
//                      />
//             )}
//         </>
//     );
// };

// export default OperationTypeSelect;


import React, { useState } from 'react';
import RequestBodyComponent from './RequestBodyComponent';
import pluralize from 'pluralize';

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

interface OperationTypeSelectProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: any;
    dataStructure: string;
    allDataStructures: DataStructure[];
    responseObjectFields?: DataStructure[];
    selectedResponseObject?: string;
    isCollection: boolean;
    associationModeOn: boolean;

}

const OperationTypeSelect: React.FC<OperationTypeSelectProps> = ({
    index,
    operationIndex,
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
                isCollection && associationModeOn && selectedResponseObject ? (
                    <div>
                        {/* <h2>Association mode combined with collection</h2> */}
                        <p>Suggested Path: {pluralizeAndNoSpaces(dataStructure)}/{`{id}`}/{pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}</p>
                    </div>
                ) : !isCollection && associationModeOn && selectedResponseObject ? (
                    <div>
                        {/* <h2>Association mode combined with singleton</h2> */}
                        <p>Suggested Path: {pluralizeAndNoSpaces(dataStructure)}/{`{id}`}/{pluralizeAndNoSpaces((selectedResponseObject as unknown as DataStructure).name)}/{`{id}`}</p>
                    </div>

                ) : isCollection && !associationModeOn ? (
                    
                    <div>
                        {/* <h2>Collection with main data structure</h2> */ }
                        <p> Suggested Path: {pluralizeAndNoSpaces(dataStructure)} </p>
                    </div>
                ) : !isCollection && !associationModeOn ? (
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

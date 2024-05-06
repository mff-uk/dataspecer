// import { Switch } from "../components/ui/switch.tsx";
// import ResponseObjectSelect from './ResponseObjectSelect';
// import React, { useState } from 'react';
// import { DataStructure} from '@/Models/DataStructureNex';



// interface IsAssociationSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[]
//     setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
//     setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
//     setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>; 
// }



// const handleAssociationModeChecked = (checked, index, operationIndex, setValue, setSelectedAssociationMode) => {
//     setValue(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`, checked);
//     setSelectedAssociationMode(checked);

// }

// /* LabeledInput - react functional component */
// const Association: React.FC<IsAssociationSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName, dataStructures, setSelectedResponseObject, setResponseObjectFields, setAssociationModeOn }) => {
//     const [selectedAssociationMode, setSelectedAssociationMode] = useState(register(`dataStructures.${index}.operations.${operationIndex}.oAssociationMode`).value);

//     const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
//     //console.log("selected data structure is" + JSON.stringify(selectedDataStructure))
//     //const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields.filter(field => field.type === 'Object') : [];
//     const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields
//     .filter(field => field.type === 'Object' && field.nestedFields) // Filter fields that are of type 'Object' and have nestedFields
//     .map(field => ({
//         id: field.nestedFields.id, // Use the ID from nestedFields
//         givenName: field.nestedFields.name, // Use the name as the givenName from nestedFields
//         name: field.name, // Use the field's name
//         fields: field.nestedFields.fields, // Use the fields from nestedFields
//     }))
//     : [];

//     React.useEffect(() => {
//         setResponseObjectFields(objectFields);
//     }, [objectFields, setResponseObjectFields]);

//     React.useEffect(() => {
//         setSelectedAssociationMode(selectedAssociationMode);
//         setAssociationModeOn(selectedAssociationMode);

// }, [register(`dataStructures.${index}.operations.${operationIndex}.isCollection`).value, selectedAssociationMode, setAssociationModeOn, index, operationIndex]);
    
    
//     return (
//         <div className="p-1 flex items-center justify-between mr-5">
//             <div>
//                 <label>Association Mode: </label>
//                 <Switch 
//                     {...register(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`)}
//                     checked={selectedAssociationMode}
//                     onCheckedChange={(checked) => handleAssociationModeChecked(checked, index, operationIndex, setValue, setSelectedAssociationMode)}
//                 />
//             </div>


//             {/* Conditionally render ResponseObjectSelect based on selectedAssociationMode */}
//             {selectedAssociationMode && (
//                 <div>
//                     <label>Target Datastructure: </label>
//                     <ResponseObjectSelect
//                         key={`responseObject_${index}`}
//                         index={index}
//                         operationIndex={operationIndex}
//                         register={register}
//                         dataStructures={objectFields}
//                         isResponseObj={true}
//                         onChange={(selectedDataStructure) => {
//                             setSelectedResponseObject(selectedDataStructure);
//                             register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
//                                 target: {
//                                     value: selectedDataStructure.name,
//                                 },
//                             });
//                         }}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Association;

// import React, { useEffect, useState } from 'react';
// import { Switch } from "../components/ui/switch";
// import ResponseObjectSelect from './ResponseObjectSelect';
// import { DataStructure } from '@/Models/DataStructureNex';

// interface IsAssociationSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: (path: string, value: any) => void;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
//     setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
//     setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const handleAssociationModeChecked = (
//     checked: boolean,
//     index: number,
//     operationIndex: number,
//     setValue: (path: string, value: any) => void,
//     setSelectedAssociationMode: React.Dispatch<React.SetStateAction<boolean>>
// ) => {
//     const path = `dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`;
//     setValue(path, checked);
//     setSelectedAssociationMode(checked);
// };

// const Association: React.FC<IsAssociationSwitchProps> = ({
//     index,
//     operationIndex,
//     register,
//     setValue,
//     dataStructureName,
//     dataStructures,
//     setSelectedResponseObject,
//     setResponseObjectFields,
//     setAssociationModeOn
// }) => {
//     // Initialize local state from form state using `register`
//     const path = `dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`;
//     const formState = register(path);
//     const [selectedAssociationMode, setSelectedAssociationMode] = useState(formState.value);

//     // Keep local state in sync with form state and set association mode
//     useEffect(() => {
//         setSelectedAssociationMode(formState.value);
//         setAssociationModeOn(formState.value);
//     }, [formState.value, setAssociationModeOn]);

//     // Get object fields from the data structure
//     const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
//     const objectFields = selectedDataStructure ? selectedDataStructure.fields
//         .filter(field => field.type === 'Object' && field.nestedFields)
//         .map(field => ({
//             id: field.nestedFields.id,
//             givenName: field.nestedFields.name,
//             name: field.name,
//             fields: field.nestedFields.fields,
//         })) : [];

//     // Set response object fields
//     useEffect(() => {
//         setResponseObjectFields(objectFields);
//     }, [objectFields, setResponseObjectFields]);

//     return (
//         <div className="p-1 flex items-center justify-between mr-5">
//             <div>
//                 <label>Association Mode: </label>
//                 <Switch
//                     {...formState}
//                     checked={selectedAssociationMode}
//                     onCheckedChange={(checked) => handleAssociationModeChecked(
//                         checked,
//                         index,
//                         operationIndex,
//                         setValue,
//                         setSelectedAssociationMode
//                     )}
//                 />
//             </div>
//             {selectedAssociationMode && (
//                 <div>
//                     <label>Target Datastructure: </label>
//                     <ResponseObjectSelect
//                         index={index}
//                         operationIndex={operationIndex}
//                         register={register}
//                         dataStructures={objectFields}
//                         isResponseObj={true}
//                         onChange={(selectedDataStructure) => {
//                             setSelectedResponseObject(selectedDataStructure);
//                             const responseObjectPath = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
//                             setValue(responseObjectPath, selectedDataStructure.name);
//                         }}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Association;


import React, { useEffect, useState } from 'react';
import { Switch } from "../components/ui/switch";
import ResponseObjectSelect from './ResponseObjectSelect';
import { DataStructure } from '@/Models/DataStructureNex';

interface IsAssociationSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: (path: string, value: any) => void;
    getValues: any;
    dataStructureName: string;
    dataStructures: DataStructure[];
    setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
    setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
    setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Association: React.FC<IsAssociationSwitchProps> = ({
    index,
    operationIndex,
    register,
    setValue,
    getValues,
    dataStructureName,
    dataStructures,
    setSelectedResponseObject,
    setResponseObjectFields,
    setAssociationModeOn
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`;

    const formState = register(path);

    // Initialize local state
    const [selectedAssociationMode, setSelectedAssociationMode] = useState(formState.value);

    // Sync local state and form state
    useEffect(() => {
        const currentFormValue = getValues(path);
        console.log(`Form state value for ${path}:`, currentFormValue);
        if (currentFormValue !== selectedAssociationMode) {
            setSelectedAssociationMode(currentFormValue);
            setAssociationModeOn(currentFormValue);
        }
    }, [path, getValues, selectedAssociationMode, setAssociationModeOn]);

    // Handle changes to the switch
    const handleSwitchChange = (checked: boolean) => {
        console.log(`Switch changed to: ${checked}`);
        setValue(path, checked);
        setSelectedAssociationMode(checked);
        setAssociationModeOn(checked);
    };

    // Get object fields from the data structure
    const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
    const objectFields = selectedDataStructure ? selectedDataStructure.fields
        .filter(field => field.type === 'Object' && field.nestedFields)
        .map(field => ({
            id: field.nestedFields.id,
            givenName: field.nestedFields.name,
            name: field.name,
            fields: field.nestedFields.fields,
        })) : [];

    // Set response object fields
    useEffect(() => {
        console.log('Setting response object fields:', objectFields);
        setResponseObjectFields(objectFields);
    }, [objectFields, setResponseObjectFields]);

    return (
        <div className="p-1 flex items-center justify-between mr-5">
            <div>
                <label>Association Mode: </label>
                <Switch
                    {...formState}
                    checked={selectedAssociationMode}
                    onCheckedChange={handleSwitchChange}
                />
            </div>
            {selectedAssociationMode && (
                <div>
                    <label>Target Datastructure: </label>
                    <ResponseObjectSelect
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructures={objectFields}
                        isResponseObj={true}
                        onChange={(selectedDataStructure) => {
                            setSelectedResponseObject(selectedDataStructure);
                            const responseObjectPath = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
                            setValue(responseObjectPath, selectedDataStructure.name);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Association;

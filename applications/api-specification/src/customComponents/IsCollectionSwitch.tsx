// import { Switch } from "../components/ui/switch.tsx";
// import React, { useState } from 'react';
// import { DataStructure} from '@/Models/DataStructureNex';

// interface IsCollectionSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[]
//     setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
//     setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
//     setIsCollection: React.Dispatch<React.SetStateAction<boolean>>; 

// }

// const handleCollectionModeChecked = (checked, index, operationIndex, setValue, setSelectedIsCollection) => {

//     setValue(`dataStructures.${index}.operations.${operationIndex}.isCollection`, checked);
//     setSelectedIsCollection(checked);
// }

// /* LabeledInput - react functional component */
// const IsCollection: React.FC<IsCollectionSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName, dataStructures, setSelectedResponseObject, setResponseObjectFields, setIsCollection }) => {
//     const [selectedIsCollection, setSelectedIsCollection] = useState(register(`dataStructures.${index}.operations.${operationIndex}.isCollection`).value);

//     const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
//     const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields
//     .filter(field => field.type === 'Object' && field.nestedFields) 
//     .map(field => ({
//         id: field.nestedFields.id, 
//         givenName: field.nestedFields.name, 
//         name: field.name, 
//         fields: field.nestedFields.fields,
//     }))
//     : [];

//     React.useEffect(() => {
//         setResponseObjectFields(objectFields);
//     }, [objectFields, setResponseObjectFields]);

//     React.useEffect(() => {
//             setSelectedIsCollection(selectedIsCollection);
//             setIsCollection(selectedIsCollection);
    
//     }, [register(`dataStructures.${index}.operations.${operationIndex}.isCollection`).value, selectedIsCollection, setIsCollection, index, operationIndex]);
    
    

//     return (
//         <div className="p-1 flex items-center">
//             <div>
//                 <label>Treat resource as a collection: </label>
//                 <Switch 
//                     checked={selectedIsCollection}
//                     onCheckedChange={(checked) => handleCollectionModeChecked(checked, index, operationIndex, setValue, setSelectedIsCollection)}
//                 />
//             </div>
//         </div>
//     );
// };

// export default IsCollection;


// import React, { useEffect, useState } from 'react';
// import { Switch } from "../components/ui/switch";
// import { DataStructure } from '@/Models/DataStructureNex';

// interface IsCollectionSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: (path: string, value: any) => void;
//     getValues: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const IsCollection: React.FC<IsCollectionSwitchProps> = ({
//     index,
//     operationIndex,
//     register,
//     setValue,
//     dataStructureName,
//     dataStructures,
//     setIsCollection,
//     getValues
// }) => {
//     const path = `dataStructures.${index}.operations.${operationIndex}.isCollection`;

//     const formState = register(path);

//     useEffect(() => 
//     {
//         console.log(formState.value)
//     }, [formState.value])

//     const handleCollectionModeChecked = (checked: boolean) => {
//         console.log("checked " + checked);
//         console.log("path " + path);
//         setValue(path, checked);

//         const currentValue = getValues(path);
//         console.log("Current value from form state: ", currentValue);
//     };

//     return (
//         <div className="p-1 flex items-center">
//             <label>Treat resource as a collection: </label>
//             <Switch
//                 {...register(path)}
//                 checked={formState.value}
//                 onCheckedChange={handleCollectionModeChecked}
//             />
//         </div>
//     );
// };

// export default IsCollection;

// import React, { useEffect, useState } from 'react';
// import { Switch } from "../components/ui/switch";
// import { DataStructure } from '@/Models/DataStructureNex';
// import { useFormContext } from 'react-hook-form';

// interface IsCollectionSwitchProps {
//     index: number;
//     operationIndex: number;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const IsCollection: React.FC<IsCollectionSwitchProps> = ({
//     index,
//     operationIndex,
//     dataStructureName,
//     dataStructures,
//     setIsCollection
// }) => {
//     const { register, setValue, getValues, watch } = useFormContext();

//     const path = `dataStructures.${index}.operations.${operationIndex}.isCollection`;

//     // Use `watch` to keep track of the form state for the specified path
//     const currentCollectionState = watch(path);

//     useEffect(() => {
//         // Log the current state
//         console.log("currentCollectionState: ", currentCollectionState);
//         // Sync local state with the form state
//         setIsCollection(currentCollectionState);
//     }, [currentCollectionState, setIsCollection]);

//     const handleCollectionModeChecked = (checked: boolean) => {
//         setValue(path, checked);
//         console.log("checked: ", checked);
//         console.log("path: ", path);

//         const currentValue = getValues(path);
//         console.log("Current value from form state: ", currentValue);
//     };

//     return (
//         <div className="p-1 flex items-center">
//             <label>Treat resource as a collection: </label>
//             <Switch
//                 {...register(path)}
//                 checked={currentCollectionState !== undefined ? currentCollectionState : false}
//                 onCheckedChange={handleCollectionModeChecked}
//             />
//         </div>
//     );
// };

// export default IsCollection;

import React, { useEffect, useState } from 'react';
import { Switch } from "../components/ui/switch";
import { DataStructure } from '@/Models/DataStructureNex';

interface IsCollectionSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: (path: string, value: any) => void;
    getValues: any;
    dataStructureName: string;
    dataStructures: DataStructure[];
    setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
}

const IsCollection: React.FC<IsCollectionSwitchProps> = ({
    index,
    operationIndex,
    register,
    setValue,
    getValues,
    dataStructureName,
    dataStructures,
    setIsCollection
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.isCollection`;

    const formState = register(path);

    const [currentIsCollection, setCurrentIsCollection] = useState(formState.value || false);

    useEffect(() => {
        const newValue = getValues(path);
        if (currentIsCollection !== newValue) {
            setCurrentIsCollection(newValue);
        }
    }, [currentIsCollection, getValues, path]);

    useEffect(() => {
        setIsCollection(currentIsCollection);
    }, [currentIsCollection, setIsCollection]);

    const handleSwitchChange = (checked: boolean) => {
        setValue(path, checked);  
        setCurrentIsCollection(checked); 
    };

    return (
        <div className="p-1 flex items-center">
            <label>Treat resource as a collection: </label>
            <Switch
                {...formState}
                checked={currentIsCollection}
                onCheckedChange={handleSwitchChange}
            />
        </div>
    );
};

export default IsCollection;



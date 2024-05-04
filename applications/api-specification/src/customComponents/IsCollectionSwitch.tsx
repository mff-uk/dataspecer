import { Switch } from "../components/ui/switch.tsx";
import React, { useState } from 'react';
import { DataStructure} from '@/Models/DataStructureNex';

interface IsCollectionSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: any;
    dataStructureName: string;
    dataStructures: DataStructure[]
    setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
    setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
    setIsCollection: React.Dispatch<React.SetStateAction<boolean>>; 

}

const handleCollectionModeChecked = (checked, index, operationIndex, setValue, setSelectedIsCollection) => {

    setValue(`dataStructures.${index}.operations.${operationIndex}.isCollection`, checked);
    setSelectedIsCollection(checked);
}

/* LabeledInput - react functional component */
const IsCollection: React.FC<IsCollectionSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName, dataStructures, setSelectedResponseObject, setResponseObjectFields, setIsCollection }) => {
    const [selectedIsCollection, setSelectedIsCollection] = useState(register(`dataStructures.${index}.operations.${operationIndex}.isCollection`).value);

    const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
    const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields
    .filter(field => field.type === 'Object' && field.nestedFields) 
    .map(field => ({
        id: field.nestedFields.id, 
        givenName: field.nestedFields.name, 
        name: field.name, 
        fields: field.nestedFields.fields,
    }))
    : [];

    React.useEffect(() => {
        setResponseObjectFields(objectFields);
    }, [objectFields, setResponseObjectFields]);

    React.useEffect(() => {
            setSelectedIsCollection(selectedIsCollection);
            setIsCollection(selectedIsCollection);
    
    }, [register(`dataStructures.${index}.operations.${operationIndex}.isCollection`).value, selectedIsCollection, setIsCollection, index, operationIndex]);
    
    

    return (
        <div className="p-1 flex items-center">
            <div>
                <label>Treat resource as a collection: </label>
                <Switch 
                    checked={selectedIsCollection}
                    onCheckedChange={(checked) => handleCollectionModeChecked(checked, index, operationIndex, setValue, setSelectedIsCollection)}
                />
            </div>
        </div>
    );
};

export default IsCollection;
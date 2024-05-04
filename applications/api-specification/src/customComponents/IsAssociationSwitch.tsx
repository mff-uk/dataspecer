import { Switch } from "../components/ui/switch.tsx";
import ResponseObjectSelect from './ResponseObjectSelect';
import React, { useState } from 'react';
import { DataStructure} from '@/Models/DataStructureNex';



interface IsAssociationSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: any;
    dataStructureName: string;
    dataStructures: DataStructure[]
    setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
    setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
}



const handleAssociationModeChecked = (checked, index, operationIndex, setValue, setSelectedAssociationMode) => {
    setValue(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`, checked);
    setSelectedAssociationMode(checked);

}

/* LabeledInput - react functional component */
const Association: React.FC<IsAssociationSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName, dataStructures, setSelectedResponseObject, setResponseObjectFields }) => {
    const [selectedAssociationMode, setSelectedAssociationMode] = useState(register(`dataStructures.${index}.operations.${operationIndex}.oAssociationMode`).value);

    const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
    //console.log("selected data structure is" + JSON.stringify(selectedDataStructure))
    //const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields.filter(field => field.type === 'Object') : [];
    const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields
    .filter(field => field.type === 'Object' && field.nestedFields) // Filter fields that are of type 'Object' and have nestedFields
    .map(field => ({
        id: field.nestedFields.id, // Use the ID from nestedFields
        givenName: field.nestedFields.name, // Use the name as the givenName from nestedFields
        name: field.name, // Use the field's name
        fields: field.nestedFields.fields, // Use the fields from nestedFields
    }))
    : [];

    React.useEffect(() => {
        setResponseObjectFields(objectFields);
    }, [objectFields, setResponseObjectFields]);
    
    return (
        <div className="p-1 flex items-center">
            <div>
                <label>Association Mode: </label>
                <Switch 
                    checked={selectedAssociationMode}
                    onCheckedChange={(checked) => handleAssociationModeChecked(checked, index, operationIndex, setValue, setSelectedAssociationMode)}
                />
            </div>


            {/* Conditionally render ResponseObjectSelect based on selectedAssociationMode */}
            {selectedAssociationMode && (
                <div>
                    <label>Target Datastructure: </label>
                    <ResponseObjectSelect
                        key={`responseObject_${index}`}
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructures={objectFields}
                        isResponseObj={true}
                        onChange={(selectedDataStructure) => {
                            setSelectedResponseObject(selectedDataStructure);
                            register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
                                target: {
                                    value: selectedDataStructure.name,
                                },
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Association;
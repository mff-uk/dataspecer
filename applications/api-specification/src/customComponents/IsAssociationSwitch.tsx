import { Switch } from "../components/ui/switch.tsx";
import ResponseObjectSelect from './ResponseObjectSelect';
import React, { useState } from 'react';


interface IsAssociationSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: any;
    dataStructureName: string;
    dataStructures: DataStructure[]
}


const handleAssociationModeChecked = (checked, index, operationIndex, setValue, setSelectedAssociationMode) => {
    setValue(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`, checked);
    setSelectedAssociationMode(checked);

}

/* LabeledInput - react functional component */
const Association: React.FC<IsAssociationSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName, dataStructures }) => {
    const [selectedAssociationMode, setSelectedAssociationMode] = useState(register(`dataStructures.${index}.operations.${operationIndex}.oAssociationMode`).value);

    const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
    console.log("selectedDS is:"  + JSON.stringify(selectedDataStructure))
    const objectFields: DataStructure[] = selectedDataStructure ? selectedDataStructure.fields.filter(field => field.type === 'Object') : [];
    console.log("population " + JSON.stringify(objectFields))
    // const nestedFields = selectedDataStructure ? selectedDataStructure.fields
    // .filter(field => field.type === 'Object')
    // .map(field => field.nestedFields) : [];

    return (
        <div className="p-1 flex items-center">
            <Switch
                checked={selectedAssociationMode}
                onCheckedChange={(checked) => handleAssociationModeChecked(checked, index, operationIndex, setValue, setSelectedAssociationMode)}
            />

            {/* Conditionally render DataStructuresSelect based on selectedAssociationMode */}
            {selectedAssociationMode && (
                <div>
                    <label>Choose Data Structure:</label>
                    <ResponseObjectSelect
                        key={`responseObject_${index}`}
                        index={index}
                        operationIndex={operationIndex}
                        register={register}
                        dataStructures={objectFields}
                        isResponseObj={true}
                        onChange={(selectedDataStructure) => {
                            register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
                                target: {
                                    value: selectedDataStructure.name,
                                },
                            });
                        }}
                    />
                </div>
            )}

            {/* <div>
                <label>Choose Data Structure:</label>
                <DataStructuresSelect
                    key={`responseObject_${index}`}
                    index={index}
                    operationIndex={operationIndex}
                    register={register}
                    dataStructures={dataStructures}
                    isResponseObj={true}
                    onChange={(selectedDataStructure) => {
                        register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
                            target: {
                                value: selectedDataStructure.name,
                            },
                        });
                    }} />
            </div> */}
        </div>
    );
};

export default Association;
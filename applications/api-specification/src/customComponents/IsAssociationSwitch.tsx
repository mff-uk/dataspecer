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
    defaultValue: string;
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
    setAssociationModeOn,
    defaultValue
}) => {
    const path = `dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`;

    const formState = register(path);

    /* Local state init */
    const [selectedAssociationMode, setSelectedAssociationMode] = useState(formState.value);

    /* sync local state with form state */
    useEffect(() => {
        const currentFormValue = getValues(path);
        //console.log(`Form state value for ${path}:`, currentFormValue);
        if (currentFormValue !== selectedAssociationMode) {
            setSelectedAssociationMode(currentFormValue);
            setAssociationModeOn(currentFormValue);
        }
    }, [path, getValues, selectedAssociationMode, setAssociationModeOn]);

    const handleSwitchChange = (checked: boolean) => {
        setValue(path, checked);
        setSelectedAssociationMode(checked);
        setAssociationModeOn(checked);
    };

    useEffect(() => {
        const savedValue = getValues(`dataStructures.${index}.operations.${operationIndex}`);
        //console.log('Value saved on form:', savedValue);
    }, [index, operationIndex, getValues]);
    

    
    const selectedDataStructure = dataStructures.find(ds => ds.givenName === dataStructureName);
   // console.log("selectedDataStructure for association " + dataStructureName)
    const objectFields = selectedDataStructure ? selectedDataStructure.fields
        .filter(field => field.type === 'Object' && field.nestedFields)
        .map(field => ({
            id: field.nestedFields.id,
            givenName: field.nestedFields.name,
            name: field.name,
            fields: field.nestedFields.fields,
        })) : [];

    /* set fields of resp obj */
    useEffect(() => {
        //console.log('Setting response object fields:', objectFields);
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
                        defaultValue={defaultValue}
                        register={register}
                        dataStructures={objectFields}
                        getValues = {getValues}
                        isResponseObj={true}
                        onChange={(selectedDataStructure) => {
                            setSelectedResponseObject(selectedDataStructure);
                            const responseObjectPath = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.name`;
                            setValue(responseObjectPath, selectedDataStructure.name);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Association;


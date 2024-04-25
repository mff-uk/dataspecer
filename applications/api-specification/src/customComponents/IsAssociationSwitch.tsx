import React from 'react';
import { Switch } from "./components/ui/switch";
import DataStructuresSelect from './DataStructSelect';

interface IsAssociationSwitchProps {
    index: number;
    operationIndex: number;
    register: any;
    setValue: any;
    dataStructureName: string;
    //baseUrl: string;
    dataStructures: DataStructure[]
}

const handleAssociationModeChecked = (value, index, operationIndex) => {
    setValue(`dataStructures.${index}.operations.${operationIndex}.oAssociatonMode`, value);
}

/* LabeledInput - react functional component */ label
const Association: React.FC<IsAssociationSwitchProps> = ({ index, operationIndex, register, setValue, dataStructureName,  dataStructures}) => {
    return (
        <div className="p-1 flex items-center">
            <Switch
                {...register(`dataStructures.${index}.operations.${operationIndex}.oAssociationMode`)}
                checked={op.value}
                onCheckedChange={(checked) => handleAssociationModeChecked(checked as boolean, index, operationIndex)}
            />

            <div>
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
            </div>
        </div>
    );
};

export default Association;
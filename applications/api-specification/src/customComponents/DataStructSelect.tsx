// works for names not givenNames
import React from 'react';

function DataStructuresSelect({ index, register, dataStructures, onChange }) {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        console.log("selected value is: "  + selectedValue);
        console.log("dataStructures are: " + dataStructures)
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.givenName === selectedValue
        );

        if (onChange) {
            onChange(selectedDataStructure);
        }

        if (selectedDataStructure) {
            register(`dataStructures.${index}.name`).onChange({
                target: {
                    value: selectedDataStructure.givenName,
                },
            });
            register(`dataStructures.${index}.id`).onChange({
                target: {
                    value: selectedDataStructure.id,
                },
            });
            
        }
    };

    return (
        <select {...register(`dataStructures.${index}.name`)} onChange={handleChange} required>
            {dataStructures.map((structure) => (
                <option key={structure.id} value={structure.givenName}>
                    {structure.givenName}
                </option>
            ))}
        </select>
    );
}

export default DataStructuresSelect;

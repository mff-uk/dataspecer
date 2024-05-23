import React, { useEffect } from 'react';

function DataStructuresSelect({ index, register, dataStructures, onChange }) {

    let path = '';
    path = `dataStructures.${index}.name`;

    const handleChange = (event) => {

        const selectedValue = event.target.value;
        //console.log(selectedValue + " selected value")
        
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.givenName === selectedValue
        );

        if (onChange) {
            onChange(selectedDataStructure);
        }

        if (selectedDataStructure) {
            register(``).onChange({
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

        <select {...register(path)} onChange={handleChange} required>
            {dataStructures.map((structure) => (
                <option key={structure.id} value={structure.givenName}>
                    {structure.givenName}
                </option>
            ))}
        </select>

    );
}

export default DataStructuresSelect;

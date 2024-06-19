import React, { useState } from 'react';

/* Select component utilized for choosing data structures */
function DataStructuresSelect({ index, register, dataStructures, onChange, getValues }) {

    let path = '';
    path = `dataStructures.${index}.name`;

    const [selectedValue, setSelectedValue] = useState(getValues(path));

    const handleChange = (event) => {

        const selectedValue = event.target.value;

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
                <option key={structure.id} value={structure.givenName} selected={selectedValue === structure.givenName}>
                    {structure.givenName}
                </option>
            ))}
        </select>

    );
}

export default DataStructuresSelect;

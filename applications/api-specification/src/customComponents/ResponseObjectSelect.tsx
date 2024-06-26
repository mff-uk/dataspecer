import React, { useEffect, useState } from 'react';

/* ResponseObjectSelect - a component responsible for selecting response status codes
 * The value of this component is mapped to the responses section of the operation object
 * in the resulting OpenAPI specification
 */
function ResponseObjectSelect({ index, register, dataStructures, onChange, isResponseObj, operationIndex, getValues, defaultValue }) {
    let path = '';
    path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.name`;

    const [selectedValue, setSelectedValue] = useState(defaultValue || getValues(path));
    const [hasOnChangeTriggered, setHasOnChangeTriggered] = useState(false);

    /* Trigger on the initial render */
    useEffect(() => {
        let selectedDataStructure;
        if (selectedValue) {
            selectedDataStructure = dataStructures.find(
                (structure) => structure.name === selectedValue
            );
        }
        else if (!hasOnChangeTriggered && defaultValue) {
            selectedDataStructure = dataStructures.find(
                (structure) => structure.name === defaultValue
            );
            setHasOnChangeTriggered(true);
        }

        onChange(selectedDataStructure);

    }, [defaultValue, dataStructures, onChange, hasOnChangeTriggered]);

    const handleChange = (event) => {

        const selectedValue = event.target.value;
        setSelectedValue(selectedValue);
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.name === selectedValue
        );

        if (onChange) {
            onChange(selectedDataStructure);
        }

        if (selectedDataStructure) {

            console.log(selectedDataStructure)
            register(``).onChange({
                target: {
                    value: selectedDataStructure.name,
                },
            });

        }

    };

    return (
        <select {...register(path)} onChange={handleChange} required>
            {dataStructures.map((structure) => (
                <option key={structure.id} value={structure.name}>
                    {structure.name}
                </option>
            ))}
        </select>
    );
}

export default ResponseObjectSelect;




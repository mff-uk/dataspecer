import React, { useEffect, useState } from 'react';

function ResponseObjectSelect({ index, register, dataStructures, onChange, isResponseObj, operationIndex, getValues, defaultValue }) {
    let path = '';

    path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;

    const [hasOnChangeTriggered, setHasOnChangeTriggered] = useState(false);
    
    // Trigger onChange manually on the first render
    useEffect(() => {
        if (!hasOnChangeTriggered && defaultValue) {
            const selectedDataStructure = dataStructures.find(
                (structure) => structure.name === defaultValue
            );

            console.log("selected ds " + JSON.stringify(selectedDataStructure))
            onChange(selectedDataStructure);
            setHasOnChangeTriggered(true);
        }
    }, [defaultValue, dataStructures, onChange, hasOnChangeTriggered]);

    const handleChange = (event) => {
        
            const selectedValue = event.target.value;
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





import React from 'react';

function ResponseObjectSelect({ index, register, dataStructures, onChange,  isResponseObj, operationIndex}) {
    let path = '';
    
    path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`;
    console.log(dataStructures)
    
    const handleChange = (event) => {
        
        const selectedValue = event.target.value;
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.name === selectedValue
        );



        if (onChange) {
            onChange(selectedDataStructure);
        }

        if(selectedDataStructure )
        {
            register(``).onChange({
                target: {
                    value: selectedDataStructure.name,
                },
            });

            // register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.type`).onChange({
            //     target: {
            //         value: selectedDataStructure.type,
            //     },
            // });
        }
    };

    return (
        
        <select {...register(path)} onChange={handleChange} required>
            {dataStructures.map((structure) => (
                <option key={structure.id} value={structure.name}>
                    {structure.name + " Type: " + structure.classType}
                </option>
            ))}
        </select>
    );
}

export default ResponseObjectSelect;

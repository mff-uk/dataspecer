// import React, { useEffect } from 'react';

// function DataStructuresSelect({ index, register, dataStructures, onChange, isResponseObj, operationIndex, defaultValue }) {

//     let path = '';

//     path = `dataStructures.${index}.name`;

//     const handleChange = (event) => {

        
//         const selectedValue = event.target.value;
//         console.log(selectedValue + " selected value")
//         const selectedDataStructure = dataStructures.find(
//             (structure) => structure.givenName === selectedValue
//         );

//         if (onChange) {
//             onChange(selectedDataStructure);
//         }

//         if (selectedDataStructure) {
//             register(``).onChange({
//                 target: {
//                     value: selectedDataStructure.givenName,
//                 },
//             });
//             register(`dataStructures.${index}.id`).onChange({
//                 target: {
//                     value: selectedDataStructure.id,
//                 },
//             });
//         }


//     };

//     return (

//         <select {...register(path)} onChange={handleChange} defaultValue={defaultValue || ''} required>
//             {dataStructures.map((structure) => (
//                 <option key={structure.id} value={structure.givenName}>
//                     {structure.givenName}
//                 </option>
//             ))}
//         </select>

//     );
// }

// export default DataStructuresSelect;


// import React, { useEffect, useState } from 'react';

// function DataStructuresSelect({ index, register, dataStructures, onChange, isResponseObj, operationIndex, defaultValue }) {
//     const [selectedValue, setSelectedValue] = useState(defaultValue || '');

//     console.log("default value is: " + defaultValue);

//     useEffect(() => {
//         console.log('useEffect executed');
//         if (defaultValue) {
//             const selectedDataStruct = dataStructures.find(
//                 (structure) => structure.givenName === defaultValue
//             );

//             if (selectedDataStruct) {
//                 setSelectedValue(selectedDataStruct.givenName);
//             }
//         }
//     }, [defaultValue, dataStructures]);

//     const handleChange = (event) => {
//         const selectedValue = event.target.value;
//         const selectedDataStructure = dataStructures.find(
//             (structure) => structure.givenName === selectedValue
//         );

//         setSelectedValue(selectedValue);

//         if (onChange && selectedDataStructure) {
//             onChange(selectedDataStructure);
//         }
//     };

//     return (
//         <select
//             {...register(`dataStructures.${index}.name`)}
//             value={selectedValue}
//             onChange={handleChange}
//             required
//         >
//             {dataStructures.map((structure) => (
//                 <option key={structure.id} value={structure.givenName}>
//                     {structure.givenName}
//                 </option>
//             ))}
//         </select>
//     );
// }

//export default DataStructuresSelect;

import React, { useEffect, useState } from 'react';

function DataStructuresSelect({ index, register, dataStructures, onChange, isResponseObj, operationIndex, defaultValue }) {
    const [selectedValue, setSelectedValue] = useState(defaultValue || '');

    console.log("default value is: " + defaultValue);

    useEffect(() => {
        console.log('useEffect executed');
        if (defaultValue) {
            const selectedDataStruct = dataStructures.find(
                (structure) => structure.givenName === defaultValue
            );

            if (selectedDataStruct) {
                setSelectedValue(selectedDataStruct.givenName);
                // Update the form fields using register
                register(`dataStructures.${index}.name`).onChange({
                    target: {
                        value: selectedDataStruct.givenName,
                    },
                });
                register(`dataStructures.${index}.id`).onChange({
                    target: {
                        value: selectedDataStruct.id,
                    },
                });
            }
        }
    }, [defaultValue, dataStructures, index, register]);

    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.givenName === selectedValue
        );

        setSelectedValue(selectedValue);

        if (onChange && selectedDataStructure) {
            onChange(selectedDataStructure);
        }

        if (selectedDataStructure) {
            // Update the form fields using register
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
        <select
            {...register(`dataStructures.${index}.name`)}
            //value={defaultValue ? defaultValue : ''}
            onChange={handleChange}
            required
            {...(defaultValue && { value: defaultValue })}
        >
            {dataStructures.map((structure) => (
                <option key={structure.id} value={structure.givenName}>
                    {structure.givenName}
                </option>
            ))}
        </select>
    );
}

export default DataStructuresSelect;




// works for names not givenNames
// import React from 'react';

// function DataStructuresSelect({ index, register, dataStructures, onChange,  isResponseObj, operationIndex}) {
//     let path = '';
    
//     if(isResponseObj)
//     {
//         path = `dataStructures.${index}.operations.${operationIndex}.oResponseObject`;
//     }
//     else
//     {
//         path = `dataStructures.${index}.name`;
//     }
    
//     const handleChange = (event) => {
        
//         const selectedValue = event.target.value;
//         const selectedDataStructure = dataStructures.find(
//             (structure) => structure.givenName === selectedValue
//         );

//         if (onChange) {
//             onChange(selectedDataStructure);
//         }

//         if (selectedDataStructure && !isResponseObj) {
//             register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.givenName`).onChange({
//                 target: {
//                     value: selectedDataStructure.givenName,
//                 },
//             });
//             register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.id`).onChange({
//                 target: {
//                     value: selectedDataStructure.id,
//                 },
//             });
//             register(`dataStructures.${index}.operations.${operationIndex}.oResponseObject.name`).onChange({
//                 target: {
//                     value: selectedDataStructure.name,
//                 },
//             });
            
//         }
//         else if(selectedDataStructure && isResponseObj)
//         {
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
        
//         <select {...register(path)} onChange={handleChange} required>
//             {dataStructures.map((structure) => (
//                 <option key={structure.id} value={structure.givenName}>
//                     {structure.givenName}
//                 </option>
//             ))}
//         </select>
//     );
// }

// export default DataStructuresSelect;


// works for names not givenNames
import React from 'react';

function DataStructuresSelect({ index, register, dataStructures, onChange,  isResponseObj, operationIndex}) {
    let path = '';
    


    path = `dataStructures.${index}.name`;
    
    
    const handleChange = (event) => {
        
        const selectedValue = event.target.value;
        const selectedDataStructure = dataStructures.find(
            (structure) => structure.givenName === selectedValue
        );

        if (onChange) {
            onChange(selectedDataStructure);
        }

        if(selectedDataStructure )
        {
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

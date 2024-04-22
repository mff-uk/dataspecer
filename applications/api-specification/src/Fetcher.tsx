// import useSWR from 'swr';

// // TODO: this has to take data specification iri as parameter
// export async function fetchDataSpecificationInfo() 
// {
//     const fetcher = async (url: string) => 
//     {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Response - not OK');
//         }
//         return response.json();
//     };

//     const { data, error } = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher);

//     if (error) 
//     {
//         console.error("Info about Data Specification could not be fetched: ", error);
//         return;
//     }

//     // Get iris of Data Structures
//     const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) => resource.types.includes("http://dataspecer.com/resources/v1/psm"))
//                                       .map((resource: { iri: any; }) => resource.iri);

//     // Get Data Structures corresponding to their iris
//     const fetchPromises = dsIris.map(iri =>
//         fetch("https://backend.dataspecer.com/resources/blob?iri=" + iri)
//             .then(response => response.json())
//             .catch(error => {
//                 console.error(`Info about Data Structure with ${iri}: could not be fetched. Error: `, error);
//                 return null; 
//             })
//     );

//     try 
//     {
//         const dataStructArr = await Promise.all(fetchPromises);
//         const validDataStructures = dataStructArr.filter(data => data !== null);
//         return validDataStructures;
//     } 
//     catch (error) 
//     {
//         console.error("Data could not be fetched: ", error);
//         return null;
//     }
// }

//     // let fetchedDataStructuresArray = []; 

//     // fetchDataSpecificationInfo().then(dataStructures => {
//     //     if (dataStructures) 
//     //     {
//     //         fetchedDataStructuresArray = dataStructures;
//     //         console.log("Data structures fetched:", dataStructures);
//     //         console.log("Contents of fetchedDataStructuresArray:", fetchedDataStructuresArray);
//     //     } 
//     //     else 
//     //     {
//     //         console.log("No data structures found.");
//     //     }
//     // });



// import useSWR from 'swr';

// // Define a custom hook to fetch data specification info
// export function useDataSpecificationInfo() {
//     // Define the fetcher function
//     const fetcher = async (url: string) => {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Response - not OK');
//         }
//         return response.json();
//     };

//     // Use SWR to fetch data
//     const { data, error } = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher);

//     // Handle error
//     if (error) {
//         console.error("Info about Data Specification could not be fetched: ", error);
//         return null;
//     }

//     // Function to fetch data structures
//     const fetchDataStructures = async () => {
//         // Get IRIs of Data Structures
//         const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) => resource.types.includes("http://dataspecer.com/resources/v1/psm"))
//             .map((resource: { iri: any; }) => resource.iri);

//         // Fetch Data Structures corresponding to their IRIs
//         const fetchPromises = dsIris.map(iri =>
//             fetch("https://backend.dataspecer.com/resources/blob?iri=" + iri)
//                 .then(response => response.json())
//                 .catch(error => {
//                     console.error(`Info about Data Structure with IRI ${iri}: could not be fetched. Error: `, error);
//                     return null;
//                 })
//         );

//         try {
//             const dataStructArr = await Promise.all(fetchPromises);
//             const validDataStructures = dataStructArr.filter(data => data !== null);
//             return validDataStructures;
//         } catch (error) {
//             console.error("Data could not be fetched: ", error);
//             return null;
//         }
//     };

//     return {

//         fetchDataStructures
//     };
// }


import useSWR from 'swr';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDataTypeName } from './DataTypeAdapter';

// Define a custom hook to fetch data specification info
export function useDataSpecificationInfo() {
    // Define the fetcher function
    const fetcher = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response - not OK');
        }
        return response.json();
    };

    // Use SWR to fetch data
    const { data, error } = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher);

    // Handle error
    if (error) {
        console.error("Info about Data Specification could not be fetched: ", error);
        return null;
    }

    // Memoize the function `fetchDataStructures` with `useCallback` to avoid unnecessary re-fetching
    const fetchDataStructures = useCallback(async () => {
        if (!data) return null; // Return early if data is not available

        // Get IRIs of Data Structures
        const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) => resource.types.includes("http://dataspecer.com/resources/v1/psm"))
            .map((resource: { iri: any; }) => resource.iri);

        // If there are no data structure IRIs, return early
        if (!dsIris || dsIris.length === 0) return null;

        // Fetch data structures corresponding to the IRIs
        const fetchPromises = dsIris.map(iri =>
            fetch(`https://backend.dataspecer.com/resources/blob?iri=${iri}`)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching data structure with IRI ${iri}:`, error);
                    return null; // Return null in case of error
                })
        );

        try {
            // Use Promise.all to wait for all fetch promises to complete
            const dataStructArr = await Promise.all(fetchPromises);
            // Filter out any null values (failed fetches)
            //const validDataStructures = dataStructArr.filter(data => data !== null);
            //console.log(validDataStructures)
            //return validDataStructures;
            const processedDataStructures: DataStructure[] = dataStructArr.map((dataStructure) => {
                if (!dataStructure) return null;

                const resources = dataStructure.resources || {};
                //console.log(resources)
                const rootClass = Object.values<any>(resources)
                    .find(resource => resource.types.includes("https://ofn.gov.cz/slovník/psm/Schema"))
                    ?.dataPsmRoots?.[0];
                
                const givenName = Object.values<any>(resources)
                .find(resource => resource.types.includes("https://ofn.gov.cz/slovník/psm/Schema"))
                ?.dataPsmHumanLabel.en

                const properties: { [key: string]: string } = {};
                const id = uuidv4();
                const name = dataStructure.resources[rootClass].dataPsmTechnicalLabel 
                const interpretation = dataStructure.resources[rootClass].dataPsmInterpretation

                const rootPropertyIris = dataStructure.resources[rootClass].dataPsmParts
                for (const rootIri of rootPropertyIris) {
                    const property = dataStructure.resources[rootIri];
                    
                    if(property)
                    {
                        const propName = property.dataPsmTechnicalLabel;
                        const dataType = property.dataPsmDatatype;
                        //console.log(`Data structure is: ${name}, properties are: ${propName} and prop type is: ${dataType}`);
                        const dataTypeName = getDataTypeName(dataType);
                        properties[propName] = dataTypeName;
                    }
                }

                return {
                    id,
                    name,
                    givenName,
                    properties,
                };

            }).filter(dataStructure => dataStructure !== null); 

            console.log(processedDataStructures)
            return processedDataStructures;

        } catch (error) {
            console.error('Error fetching data structures:', error);
            return null;
        }
    }, [data]);

    return {
        fetchDataStructures
    };
}

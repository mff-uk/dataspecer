import useSWR from 'swr';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDataTypeName } from './DataTypeAdapter';
import { DataStructure, Field } from './Models/DataStructureNex.tsx';

// Custom hook: fetch data specification info
export function useDataSpecificationInfo() {
    // Define the fetcher function
    const fetcher = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response - not OK');
        }
        return response.json();
    };

    /* 
     * Fetch DataSpecification Object and store it into data
     * In case of an usuccessfull fetching the error is stored in error
     */
    const { data, error } = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher);

    // Handle error in case of unsuccessful fetching
    if (error) {
        console.error("Info about Data Specification could not be fetched:", error);
        return null;
    }

    // Memoize the function `fetchDataStructures` with `useCallback` to avoid unnecessary re-fetching
    const fetchDataStructures = useCallback(async () => {
        // If data is not available, return null
        if (!data) return null;

        // Extract IRIs (ids) of data structures of data specification
        const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) =>
            resource.types.includes("http://dataspecer.com/resources/v1/psm")
        ).map((resource: { iri: any; }) => resource.iri);

        // const test = data?.subResources?.filter((resource: { types: string | string[]; }) =>
        // resource.types.includes("http://dataspecer.com/resources/v1/pim"));

        // console.log(test)
        // If dataspecification does not contain data structures, return
        if (!dsIris || dsIris.length === 0) return null;

        /* 
         * Fetch DataStructure Object based on its iri (id)
         */
        const fetchPromises = dsIris.map(iri =>
            fetch(`https://backend.dataspecer.com/resources/blob?iri=${iri}`)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching data structure with IRI ${iri}:`, error);
                    return null; // Return null if fetching failed
                })
        );

        // wait for all fetch promises to complete (Promise.all)
        const dataStructArr = await Promise.all(fetchPromises);
        console.log(JSON.stringify(dataStructArr))

        
        /* dataStructArr contains datastructures inside data specification 
         * form of the element object - operations and resources 
         * relevant information is stored in the element object.resources
         */

        // process data structures - Iterate over dataStructArr and construct representation of datastructures
        const processedDataStructures: DataStructure[] = dataStructArr.map((dataStructure) => {
            if (!dataStructure) return null;

            const resources = dataStructure.resources || {};

            const rootClass = Object.values<any>(resources)
                .find(resource => resource.types.includes("https://ofn.gov.cz/slovník/psm/Schema"))
                ?.dataPsmRoots?.[0];

            // givenName - the name that the user has set for the data structure
            const givenName = Object.values<any>(resources)
                .find(resource => resource.types.includes("https://ofn.gov.cz/slovník/psm/Schema"))
                ?.dataPsmHumanLabel.en;

            // set unique identifier
            const id = uuidv4();
            
            // get technical label of data structure 
            const name = dataStructure.resources[rootClass]?.dataPsmTechnicalLabel;

            // get fields of the root data structure - associations and attributes (string id)
            const rootPropertyIris = dataStructure.resources[rootClass]?.dataPsmParts;

            // initialize an array of fields (attributes and associations of the data structure) and process each field recursively
            const fields: Field[] = rootPropertyIris.map((rootIri: string) => {
                return processFields(dataStructure, rootIri);
            });

            return {
                id,
                name,
                givenName,
                fields,
            };
        }).filter(dataStructure => dataStructure !== null);

        return processedDataStructures;

    }, [data]);

    return {
        fetchDataStructures,
    };
}

// processFields - function working in recursive manner to process fields
function processFields(dataStructure: any, rootIri: string): Field {
    const fieldData = dataStructure.resources[rootIri];

    if (!fieldData) {
        throw new Error(`Field data not found for IRI: ${rootIri}`);
    }

    const field: Field = {
        name: fieldData.dataPsmTechnicalLabel,
        type: fieldData.types.includes("https://ofn.gov.cz/slovník/psm/Attribute") ? getDataTypeName(fieldData.dataPsmDatatype) : "Object",
    };

    if (fieldData.types.includes("https://ofn.gov.cz/slovník/psm/AssociationEnd")) {
        const classTypeObject = dataStructure.resources[fieldData.dataPsmPart];
        field.classType = classTypeObject.dataPsmTechnicalLabel;

        if (classTypeObject.dataPsmParts) {
            field.nestedFields = {
                name: classTypeObject.dataPsmTechnicalLabel,
                givenName: classTypeObject?.dataPsmHumanLabel?.en,
                id: uuidv4(),
                fields: classTypeObject.dataPsmParts.map((nestedRootIri: string) => processFields(dataStructure, nestedRootIri)),
            };
        }
    }

    return field;
}

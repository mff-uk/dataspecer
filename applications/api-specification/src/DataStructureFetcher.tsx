import useSWR from 'swr';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { convertDataTypeName } from './DataTypeConverter.tsx';
import { DataStructure, Field } from './Models/DataStructureModel.tsx';

const backendUrl = import.meta.env.VITE_BACKEND;

// Custom hook for fetching data specification info
export function retrieveDataSpecificationInfo() {
    const fetcher = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response - not OK');
        }
        return response.json();
    };

    // Gets iri (id) from the url
    const getIri = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('package-iri');
    };

    const iri = getIri();
    const url = iri ? `${backendUrl}/resources/packages?iri=${encodeURIComponent(iri)}` : null;

    /* 
     * Fetch DataSpecification Object and store it into data
     * In case of an usuccessfull fetching the error is stored in error
     */
    const { data, error } = useSWR(url, fetcher);

    if (error) {
        console.error("Info about Data Specification could not be fetched:", error);
        return null;
    }

    // Memorizing the function fetchDataStructures with useCallback - prevents unnecessary re-fetching
    const fetchDataStructures = useCallback(async () => {
        // If data is not available, return null
        if (!data) return null;

        // Extract IRIs (ids) of data structures of data specification
        const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) =>
            resource.types.includes("http://dataspecer.com/resources/v1/psm")
        ).map((resource: { iri: any; }) => resource.iri);

        // Extract IRI (id) for retrieving cardinalities of specific data structures
        // dsIriForPim is an array containing a single element
        const dsIriForPim = data?.subResources?.filter((resource: { types: string | string[]; }) =>
            resource.types.includes("http://dataspecer.com/resources/v1/pim")
        ).map((resource: { iri: any; }) => resource.iri);

        // fetch(`https://backend.dataspecer.com/resources/blob?iri=${iri}`) pass result of dsIrisforPim as iri
        // work with resources like in psm 

        let pimData;
        if (dsIriForPim && dsIriForPim.length > 0) {

            const pimIri = dsIriForPim[0];

            pimData = await fetch(`${backendUrl}/resources/blob?iri=${pimIri}`)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching data with PIM IRI ${pimIri}:`, error);
                });
        }
        // If dataspecification does not contain data structures, return
        if (!dsIris || dsIris.length === 0) return null;

        /* 
         * Fetch DataStructure Object based on its iri (id)
         */
        const fetchPromises = dsIris.map(iri =>
            fetch(`${backendUrl}/resources/blob?iri=${iri}`)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error fetching data structure with IRI ${iri}:`, error);
                    return null;
                })
        );

        // wait for all fetch promises to complete (Promise.all)
        const dataStructArr = await Promise.all(fetchPromises);

        /* dataStructArr contains datastructures inside data specification 
         * form of the element object - operations and resources 
         * relevant information is stored in the element object.resources
         */

        // processes data structures - loop over dataStructArr and construct representation of datastructures
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
                return processFields(dataStructure, rootIri, pimData);
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
function processFields(dataStructure: any, rootIri: string, pimData: any): Field {
    const fieldData = dataStructure.resources[rootIri];
    //console.log(fieldData)
    const interpretation = fieldData.dataPsmInterpretation;
    //console.log(interpretation)

    const targetResource = Object.values<any>(pimData.resources)
        .find(resource => resource.iri.includes(interpretation))
    //console.log(targetResource)

    let isArray = false;
    let isMandatory = false;

    // determine whether field is an array
    if (targetResource) {
        if (targetResource.pimCardinalityMax) {
            //console.log(targetResource?.pimHumanLabel?.en + "with cardinality " + targetResource?.pimCardinalityMax)

            if (targetResource.pimCardinalityMax == 1) {
                isArray = false;
            }
            else {
                isArray = true;
            }

        }
        else {
            isArray = true;
        }


        // determine if a field is mandatory (has to be marked required in OpenAPI components schema)
        if (targetResource.pimCardinalityMin == 1 && targetResource.pimCardinalityMax == 1) {
            isMandatory = true;
        }

    }

    if (!fieldData) {
        throw new Error(`Field data not found for IRI: ${rootIri}`);
    }

    const field: Field = {
        isMandatory: isMandatory,
        isArray: isArray,
        name: fieldData.dataPsmTechnicalLabel,
        type: fieldData.types.includes("https://ofn.gov.cz/slovník/psm/Attribute") ? convertDataTypeName(fieldData.dataPsmDatatype) : "Object",
    };

    // Process association recursively in order to handle possible multiple levels
    if (fieldData.types.includes("https://ofn.gov.cz/slovník/psm/AssociationEnd")) {
        const classTypeObject = dataStructure.resources[fieldData.dataPsmPart];
        field.classType = classTypeObject.dataPsmTechnicalLabel;

        if (classTypeObject.dataPsmParts) {
            field.nestedFields = {
                name: classTypeObject.dataPsmTechnicalLabel,
                givenName: classTypeObject?.dataPsmHumanLabel?.en,
                id: uuidv4(),
                fields: classTypeObject.dataPsmParts.map((nestedRootIri: string) => processFields(dataStructure, nestedRootIri, pimData)),
            };
        }
    }

    return field;
}

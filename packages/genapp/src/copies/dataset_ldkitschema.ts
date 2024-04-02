export const DatasetSchema = {
    "@type": "http://www.w3.org/ns/dcat#Dataset",
    title: {
        "@id": "http://purl.org/dc/terms/title",
        "@multilang": true,
        "@type": "http://www.w3.org/2001/XMLSchema#string"
    },
    klicove_slovo: {
        "@id": "http://www.w3.org/ns/dcat#keyword",
        "@array": true
    },
    distribuce: {
        "@id": "http://www.w3.org/ns/dcat#distribution",
        "@array": true,
        "@type": "http://www.w3.org/2001/XMLSchema#string",
        "@schema": {
            "@type": "http://www.w3.org/ns/dcat#Distribution",
            title: "http://purl.org/dc/terms/title",
            url_souboru_ke_stazeni: {
                "@id": "http://www.w3.org/ns/dcat#downloadURL",
                "@array": true,
                "@type": "http://www.w3.org/2001/XMLSchema#string",
                "@schema": {
                    "@type": "http://www.w3.org/2000/01/rdf-schema#Resource"
                }
            }
        }
    }
} as const;
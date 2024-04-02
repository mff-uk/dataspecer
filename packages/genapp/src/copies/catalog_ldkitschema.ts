export const CatalogSchema = {
    "@type": "http://www.w3.org/ns/dcat#Catalog",
    title: {
        "@id": "http://purl.org/dc/terms/title",
        "@multilang": true,
        "@type": "http://www.w3.org/2001/XMLSchema#string"
    },
    provider: {
        "@id": "http://www.w3.org/2006/vcard/ns#org",
        "@type": "http://www.w3.org/2001/XMLSchema#string",
        "@schema": {
            "@type": "http://www.w3.org/2002/07/owl#Thing",
            title: {
                "@id": "http://purl.org/dc/terms/title",
                "@multilang": true,
                "@type": "http://www.w3.org/2001/XMLSchema#string"
            }
        }
    },
    datova_sada: {
        "@id": "http://www.w3.org/ns/dcat#dataset",
        "@array": true,
        "@type": "http://www.w3.org/2001/XMLSchema#string",
        "@schema": {
            "@type": "http://www.w3.org/ns/dcat#Dataset",
            title: {
                "@id": "http://purl.org/dc/terms/title",
                "@multilang": true,
                "@type": "http://www.w3.org/2001/XMLSchema#string"
            }
        }
    }
} as const;
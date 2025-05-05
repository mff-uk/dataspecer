import { SchemaInterface, createLens } from "ldkit";
import { dbo, rdfs, xsd, dcterms, createNamespace } from "ldkit/namespaces";
import { type Context, setDefaultContext } from "ldkit";
import { AggregateMetadata } from "./readers/aggregate-data-provider-model.ts";
import { LdkitArtefactGenerator } from "./ldkit-generator.ts";
import { CatalogSchema } from "./schemas/catalog-schema.ts";

async function demo() {

    // const dcat = createNamespace({
    //     iri: "http://www.w3.org/ns/dcat#",
    //     prefix: "dcat:",
    //     terms: ["Catalog", "Dataset", "keyword", "Distribution", "distribution", "downloadURL"]
    // } as const);

    const DatasetSchema = {
        "@type": "http://www.w3.org/ns/dcat#Dataset", //dcat.Dataset,
        title: {
            "@id": "http://purl.org/dc/terms/title", //dcterms.title,
            "@multilang": true
        },
        keyword: "http://www.w3.org/ns/dcat#keyword"
    } as const;

    const context: Context = {
        sources: ["https://data.cssz.cz/sparql"]
    }
    setDefaultContext(context);

    const lens = createLens(DatasetSchema);

    const objectsPromise = lens.find();

    await objectsPromise
        .then(results => {
            console.log(`Number of results: ${results.length}`)
            results.map((res, idx) => console.log(`Dataset ${idx}: `, res));
        })
        .catch(err => {
            console.error("Error: ", err);
            throw new Error(err);
        });

    let instanceIri: string = "https://data.cssz.cz/resource/dataset/ukazatele-pracovni-neschopnosti-podle-pohlavi-a-diagnozy";
    const instancePromise = lens.findByIri(instanceIri);

    await instancePromise
        .then(instance => console.log("Instance: ", instance))
        .catch(err => console.error("No matching instance: ", err));
}

async function main() {

    //console.log(createLdkitQueryFileContent());

    // const dcat = createNamespace({
    //     iri: "http://www.w3.org/ns/dcat#",
    //     prefix: "dcat:",
    //     terms: ["Catalog", "Dataset", "title"]
    // } as const);

    const generator = new LdkitArtefactGenerator();

    const datasetAggregateMetadata = await generator.generateToObject("dataset");
    console.log(datasetAggregateMetadata);

    generator.generateSourceFile(datasetAggregateMetadata);

    await demo();
}

// function createLdkitQueryFileContent() {
//     const generatedSchemaNamePlaceholder: string = "<generated ldkit schema name placeholder>";
//     const generatedFilePathPlaceholder: string = "<generated filepath placeholder>";
//     const ldkitSourceURLs: string[] = ["https://data.cssz.cz/sparql"];

//     return `
//     import * as ${generatedSchemaNamePlaceholder} from ${generatedFilePathPlaceholder};"
//     import { createLens, type Context, setDefaultContext  } from "ldkit";

//     async function ldkitMain() {
//         const context: Context = {
//             sources: [${ldkitSourceURLs}]
//         }
//         setDefaultContext(context);
    
//         const EntityLens = createLens(${generatedSchemaNamePlaceholder});
//         const fetchedEntities = await EntityLens.find();

//         return fetchedEntities;
//     }
//     ldkitMain().then(() => {});
//     `;
// }

main();
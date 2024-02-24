import { createLens } from "ldkit";
import { dbo, rdfs, xsd, dcterms, createNamespace } from "ldkit/namespaces";
import { type Context, setDefaultContext } from "ldkit";
import { AggregateMetadata } from "./readers/aggregate-data-provider-model";
import { LdkitArtefactGenerator } from "./ldkit-generator";
import { ConjuntoDeDatosSchema } from "../generated/conjunto-de-datos-ldkitschema";
import { CatalogSchema } from "../generated/catalog-ldkitschema";

//const aggregate: string = "catalog";
const aggregate: string = "dataset";

async function demo() {

    // const dcat = createNamespace({
    //     iri: "http://www.w3.org/ns/dcat#",
    //     prefix: "dcat:",
    //     terms: ["Catalog", "Dataset", "keyword", "Distribution", "distribution", "downloadURL"]
    // } as const);

    // const DatasetSchema = {
    //     "@type": "http://www.w3.org/ns/dcat#Dataset", //dcat.Dataset,
    //     title: {
    //         "@id": "http://purl.org/dc/terms/title", //dcterms.title,
    //         "@multilang": true
    //     },
    //     keyword: "http://www.w3.org/ns/dcat#keyword"
    // } as const;

    // const CatalogSchema = {
    //     "@type": "http://www.w3.org/ns/dcat#Catalog",
    //     // title: {
    //     //     "@id": dcterms.title,
    //     //     "@multilang": true
    //     // },
    //     //provider: dcterms.publisher,
    //     dataset: "http://www.w3.org/ns/dcat#Dataset"
    // } as const;

    const context: Context = {
        sources: ["https://data.cssz.cz/sparql"]
    }
    setDefaultContext(context);

    const Schema = aggregate === "catalog"
        ? CatalogSchema
        : ConjuntoDeDatosSchema;

    const Lens = createLens(Schema);

    let results;

    const objectsPromise = Lens.find();

    await objectsPromise
        .then(result => results = result)
        .catch(err => {
            console.error("Error: ", err);
            throw new Error(err);
        });

    console.log(`Number of results: ${results.length}`)
    results.map((res, idx) => console.log(`${aggregate === "catalog" ? "Catalog" : "Dataset"} ${idx}: `, res));
    
    let instanceIri: string;
    if (aggregate === "catalog") {
        instanceIri = "https://data.cssz.cz/web/otevrena-data/katalog-otevrenych-dat";
    } else {
        instanceIri = "https://data.cssz.cz/resource/dataset/ukazatele-pracovni-neschopnosti-podle-pohlavi-a-diagnozy";
    }

    const instancePromise = Lens.findByIri(instanceIri);

    await instancePromise
        .then(instance => console.log("Instance: ", instance))
        .catch(err => console.error("No matching instance: ", err));
}

async function ldkitDemo() {
    const PersonSchema = {
        "@type": dbo.Person,
        name: rdfs.label,
        abstract: dbo.abstract,
        birthDate: {
            "@id": dbo.birthDate,
            "@type": xsd.date,
        },
    } as const;

    const context: Context = {
        sources: ["https://dbpedia.org/sparql"],
    };

    setDefaultContext(context);

    const Persons = createLens(PersonSchema);

    const adaIri = "http://dbpedia.org/resource/Ada_Lovelace";
    const ada = await Persons.findByIri(adaIri);

    console.log(ada.$id);
    console.log(ada.name); // Ada Lovelace
    console.log(ada.birthDate); // Date object of 1815-12-10
}

async function main() {

    //console.log(createLdkitQueryFileContent());

    // const dcat = createNamespace({
    //     iri: "http://www.w3.org/ns/dcat#",
    //     prefix: "dcat:",
    //     terms: ["Catalog", "Dataset", "title"]
    // } as const);

    const generator = new LdkitArtefactGenerator();

    const datasetAggregateMetadata = await generator.generateToObject(aggregate); // dataset | catalog
    console.log(datasetAggregateMetadata);

    generator.generateToSourceFile(datasetAggregateMetadata);

    await demo();
}

function createLdkitQueryFileContent() {
    const generatedSchemaNamePlaceholder: string = "<generated ldkit schema name placeholder>";
    const generatedFilePathPlaceholder: string = "<generated filepath placeholder>";
    const ldkitSourceURLs: string[] = ["https://data.cssz.cz/sparql"];

    return `
    import * as ${generatedSchemaNamePlaceholder} from ${generatedFilePathPlaceholder};"
    import { createLens, type Context, setDefaultContext  } from "ldkit";

    async function ldkitMain() {
        const context: Context = {
            sources: [${ldkitSourceURLs}]
        }
        setDefaultContext(context);
    
        const EntityLens = createLens(${generatedSchemaNamePlaceholder});
        const fetchedEntities = await EntityLens.find();

        return fetchedEntities;
    }
    ldkitMain().then(() => {});
    `;
}

main();
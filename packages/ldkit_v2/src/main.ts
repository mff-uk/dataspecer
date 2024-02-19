import { createLens } from "ldkit";
import { dbo, rdfs, xsd, dcterms, createNamespace } from "ldkit/namespaces";
import { type Context, setDefaultContext } from "ldkit";
import { AggregateMetadata } from "./readers/aggregate-data-provider-model";
import { LdkitArtefactGenerator } from "./ldkit-generator";
//import { LdkitSchemaProperty, LdkitSchema } from "./interfaces/ldkit-schema-model";

async function catalog() {

    const dcat = createNamespace({
        iri: "http://www.w3.org/ns/dcat#",
        prefix: "dcat:",
        terms: ["Catalog", "Dataset", "keyword", "Distribution", "distribution", "downloadURL"]
    } as const);

    // const PublisherSchema = {
    //     "@type": "publisher",
    //     title: dcterms.publisher
    // } as const;

    const DistributionSchema = {
        "@type": dcat.Distribution,
        title: {
            "@id": dcterms.title,
            "@multilang": true
        },
        //downloadURL: dcat.downloadURL
    } as const;

    const DatasetSchema = {
        "@type": "http://www.w3.org/ns/dcat#Dataset", //dcat.Dataset,
        title: {
            "@id": "http://purl.org/dc/terms/title", //dcterms.title,
            "@multilang": true
        },
        keyword: dcat.keyword,
        klíčové_slovo: "",
        distribution: {
            "@id": dcat.distribution,
            "@schema": DistributionSchema
        }
    } as const;

    const CatalogSchema = {
        "@type": dcat.Catalog, // z json-ldContext["@context"].<EntityTitle>["@id"]
        title: {
            "@id": dcterms.title,
            "@multilang": true
        },
        provider: dcterms.publisher,
        dataset: {
            "@id": dcat.Dataset,
            "@array": true,
            "@context": DatasetSchema
        }
    } as const;

    ////////////////////////////////////////////
    ///////// Ldkit specific data part /////////

    const context: Context = {
        sources: ["https://data.cssz.cz/sparql"],
        explain: "logical"
    }
    setDefaultContext(context);

    //const Catalogs = createLens(CatalogSchema);
    const Datasets = createLens(DatasetSchema);

    //const cssz = await Catalogs.findByIri("https://data.cssz.cz/web/otevrena-data/katalog-otevrenych-dat");
    const datasets = await Datasets.find();

    ////////////////////////////////////////////

    //console.log(cssz);
    datasets.map((dataset, idx) => console.log(`Dataset Title ${idx}: `, dataset));
    ////////////////////////////////////////////
}

async function demo() {
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
    //await catalog();

    console.log(createLdkitQueryFileContent());

    // const dcat = createNamespace({
    //     iri: "http://www.w3.org/ns/dcat#",
    //     prefix: "dcat:",
    //     terms: ["Catalog", "Dataset", "title"]
    // } as const);

    const generator = new LdkitArtefactGenerator();

    generator
        .generateToObject("dataset")
        .then((result: AggregateMetadata) => {
            generator.generateToStream(result);
        })

    // // const schema = {
    // //     "@type": dcat.Dataset,
    // //     title: dcat.title,
    // //     publisher: {
    // //         "@id": dcterms.title,
    // //         "@array": true
    // //     }
    // // };

    // // const startTime = performance.now();
    // // generator.generateToStream(aggregateMetadata);
    // // const endTime = performance.now();
    // // console.log("Run time (in milliseconds): ", endTime - startTime)
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
    
        const EntityLens = createLens(context);
        const fetchedEntities = await EntityLens.find();

        return fetchedEntities;
    }
    ldkitMain().then(() => {});
    `;
}

main().then(_ => console.log("Complete"));
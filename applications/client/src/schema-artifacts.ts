import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model/data-specification-artefact";
import { DataSpecificationSchema } from "@dataspecer/core/data-specification/model/data-specification-schema";
import { CSV_SCHEMA } from "@dataspecer/csv/csv-schema";
import { RDF_TO_CSV } from "@dataspecer/csv/rdf-to-csv";
import { JsonExampleGenerator } from "@dataspecer/json-example";
import { JSON_LD_GENERATOR } from "@dataspecer/json/json-ld";
import { JSON_SCHEMA } from "@dataspecer/json/json-schema";
import { SPARQL } from "@dataspecer/sparql-query";
import { XmlConfigurator } from "@dataspecer/xml/configuration";
import { XML_COMMON_SCHEMA_GENERATOR } from "@dataspecer/xml/xml-common-schema";
import { XML_SCHEMA } from "@dataspecer/xml/xml-schema";
import { XSLT_LIFTING, XSLT_LOWERING } from "@dataspecer/xml/xml-transformations";

/**
 * This is the place to register your own artefacts if you need to.
 * @param baseUrl Public base URL of generated artifacts.
 * @param basePath Path to the base directory where the artifacts will be generated.
 */
export function getSchemaArtifacts(
    psmSchemaIri: string,
    baseUrl: string,
    basePath: string,
    configuration: object
) {
    const dataSpecificationConfiguration = DataSpecificationConfigurator.getFromObject(configuration);
    const generatorsEnabledByDefault = dataSpecificationConfiguration.generatorsEnabledByDefault!;

    const artifacts: DataSpecificationArtefact[] = [];

    const jsonSchema = new DataSpecificationSchema();
    jsonSchema.iri = `${psmSchemaIri}#jsonschema`;
    jsonSchema.generator = JSON_SCHEMA.Generator;
    const jsonSchemaFileName = dataSpecificationConfiguration.renameArtifacts?.[jsonSchema.generator] ?? "schema.json";
    jsonSchema.outputPath = `${basePath}/${jsonSchemaFileName}`;
    jsonSchema.publicUrl = `${baseUrl}/${jsonSchemaFileName}`;
    jsonSchema.psm = psmSchemaIri;
    jsonSchema.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["json"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(jsonSchema);
    }

    const jsonExample = new DataSpecificationSchema();
    jsonExample.iri = `${psmSchemaIri}#jsonExample`;
    jsonExample.generator = JsonExampleGenerator.IDENTIFIER;
    const jsonExampleFileName = dataSpecificationConfiguration.renameArtifacts?.[jsonExample.generator] ?? "example.json";
    jsonExample.outputPath = `${basePath}/${jsonExampleFileName}`;
    jsonExample.publicUrl = `${baseUrl}/${jsonExampleFileName}`;
    jsonExample.psm = psmSchemaIri;
    jsonExample.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["jsonExample"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(jsonExample);
    }

    const jsonLd = new DataSpecificationSchema();
    jsonLd.iri = `${psmSchemaIri}#jsonLd`;
    jsonLd.generator = JSON_LD_GENERATOR;
    const jsonLdFileName = dataSpecificationConfiguration.renameArtifacts?.[jsonLd.generator] ?? "context.jsonld";
    jsonLd.outputPath = `${basePath}/${jsonLdFileName}`;
    jsonLd.publicUrl = `${baseUrl}/${jsonLdFileName}`;
    jsonLd.psm = psmSchemaIri;
    jsonLd.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["json"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(jsonLd);
    }

    const xmlSchemaLocation = XmlConfigurator.getFromObject(configuration).commonXmlSchemaExternalLocation;
    const xsdCoreSchema = new DataSpecificationSchema();
    xsdCoreSchema.generator = XML_COMMON_SCHEMA_GENERATOR;
    xsdCoreSchema.iri = `${psmSchemaIri}#xsdCoreSchema`;
    xsdCoreSchema.outputPath = xmlSchemaLocation ? null : `${basePath}/2022-07.xsd`;
    xsdCoreSchema.publicUrl = xmlSchemaLocation ?? `${baseUrl}/2022-07.xsd`;
    xsdCoreSchema.psm = psmSchemaIri;
    xsdCoreSchema.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["xml"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(xsdCoreSchema);
    }

    const xmlSchema = new DataSpecificationSchema();
    xmlSchema.iri = `${psmSchemaIri}#xmlschema`;
    xmlSchema.generator = XML_SCHEMA.Generator;
    const xmlSchemaFileName = dataSpecificationConfiguration.renameArtifacts?.[xmlSchema.generator] ?? "schema.xsd";
    xmlSchema.outputPath = `${basePath}/${xmlSchemaFileName}`;
    xmlSchema.publicUrl = `${baseUrl}/${xmlSchemaFileName}`;
    xmlSchema.psm = psmSchemaIri;
    xmlSchema.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["xml"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(xmlSchema);
    }

    const xsltLifting = new DataSpecificationSchema();
    xsltLifting.iri = `${psmSchemaIri}#xsltlifting`;
    xsltLifting.generator = XSLT_LIFTING.Generator;
    const xsltLiftingFileName = dataSpecificationConfiguration.renameArtifacts?.[xsltLifting.generator] ?? "lifting.xslt";
    xsltLifting.outputPath = `${basePath}/${xsltLiftingFileName}`;
    xsltLifting.publicUrl = `${baseUrl}/${xsltLiftingFileName}`;
    xsltLifting.psm = psmSchemaIri;
    xsltLifting.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["xml"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(xsltLifting);
    }

    const xsltLowering = new DataSpecificationSchema();
    xsltLowering.iri = `${psmSchemaIri}#xsltlowering`;
    xsltLowering.generator = XSLT_LOWERING.Generator;
    const xsltLoweringFileName = dataSpecificationConfiguration.renameArtifacts?.[xsltLowering.generator] ?? "lowering.xslt";
    xsltLowering.outputPath = `${basePath}/${xsltLoweringFileName}`;
    xsltLowering.publicUrl = `${baseUrl}/${xsltLoweringFileName}`;
    xsltLowering.psm = psmSchemaIri;
    xsltLowering.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["xml"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(xsltLowering);
    }

    const csvSchema = new DataSpecificationSchema();
    csvSchema.iri = `${psmSchemaIri}#csvschema`;
    csvSchema.generator = CSV_SCHEMA.Generator;
    const csvSchemaFileName = dataSpecificationConfiguration.renameArtifacts?.[csvSchema.generator] ?? "schema.csv-metadata.json";
    csvSchema.outputPath = `${basePath}/${csvSchemaFileName}`;
    csvSchema.publicUrl = `${baseUrl}/${csvSchemaFileName}`;
    csvSchema.psm = psmSchemaIri;
    csvSchema.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["csv"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(csvSchema);
    }

    const rdfToCsv = new DataSpecificationSchema();
    rdfToCsv.iri = `${psmSchemaIri}#rdfToCsv`;
    rdfToCsv.generator = RDF_TO_CSV.Generator;
    const rdfToCsvFileName = dataSpecificationConfiguration.renameArtifacts?.[rdfToCsv.generator] ?? "rdf-to-csv/";
    rdfToCsv.outputPath = `${basePath}/${rdfToCsvFileName}`;
    rdfToCsv.publicUrl = `${baseUrl}/${rdfToCsvFileName}`;
    rdfToCsv.psm = psmSchemaIri;
    rdfToCsv.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["csv"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(rdfToCsv);
    }

    const sparqlSchema = new DataSpecificationSchema();
    sparqlSchema.iri = `${psmSchemaIri}#sparqlschema`;
    sparqlSchema.generator = SPARQL.Generator;
    const sparqlSchemaFileName = dataSpecificationConfiguration.renameArtifacts?.[sparqlSchema.generator] ?? "query.sparql";
    sparqlSchema.outputPath = `${basePath}/${sparqlSchemaFileName}`;
    sparqlSchema.publicUrl = `${baseUrl}/${sparqlSchemaFileName}`;
    sparqlSchema.psm = psmSchemaIri;
    sparqlSchema.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["sparql"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(sparqlSchema);
    }

    const shacl = new DataSpecificationSchema();
    shacl.iri = `${psmSchemaIri}#shacl`;
    shacl.generator = "https://schemas.dataspecer.com/generator/shacl";
    const shaclFileName = dataSpecificationConfiguration.renameArtifacts?.[shacl.generator] ?? "shacl-shapes.ttl";
    shacl.outputPath = `${basePath}/${shaclFileName}`;
    shacl.publicUrl = `${baseUrl}/${shaclFileName}`;
    shacl.psm = psmSchemaIri;
    shacl.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["shacl"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(shacl);
    }

    const shex = new DataSpecificationSchema();
    shex.iri = `${psmSchemaIri}#shex`;
    shex.generator = "https://schemas.dataspecer.com/generator/shex";
    const shexFileName = dataSpecificationConfiguration.renameArtifacts?.[shex.generator] ?? "validation.shex";
    shex.outputPath = `${basePath}/${shexFileName}`;
    shex.publicUrl = `${baseUrl}/${shexFileName}`;
    shex.psm = psmSchemaIri;
    shex.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["shex"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(shex);
    }

    const shexMap = new DataSpecificationSchema();
    shexMap.iri = `${psmSchemaIri}#shex-map`;
    shexMap.generator = "https://schemas.dataspecer.com/generator/shex-map";
    const shexMapFileName = dataSpecificationConfiguration.renameArtifacts?.[shexMap.generator] ?? "validation.shexmap";
    shexMap.outputPath = `${basePath}/${shexMapFileName}`;
    shexMap.publicUrl = `${baseUrl}/${shexMapFileName}`;
    shexMap.psm = psmSchemaIri;
    shexMap.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["shex"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(shexMap);
    }

    const openapi = new DataSpecificationSchema();
    openapi.iri = `${psmSchemaIri}#openapi`;
    openapi.generator = "https://schemas.dataspecer.com/generator/openapi";
    const openapiFileName = dataSpecificationConfiguration.renameArtifacts?.[openapi.generator] ?? "openapi-specification.yaml";
    openapi.outputPath = `${basePath}/${openapiFileName}`;
    openapi.publicUrl = `${baseUrl}/${openapiFileName}`;
    openapi.psm = psmSchemaIri;
    openapi.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["openapi"] ?? generatorsEnabledByDefault) !== false) {
        artifacts.push(openapi);
    }

    // const ldkit = new DataSpecificationSchema();
    // ldkit.iri = `${psmSchemaIri}#ldkit`;
    // ldkit.generator = "https://schemas.dataspecer.com/generator/LDkit";
    // const ldkitSchemaFilename = dataSpecificationConfiguration.renameArtifacts?.[ldkit.generator] ?? "ldkit-schema.ts";
    // ldkit.outputPath = `${basePath}/${ldkitSchemaFilename}`;
    // ldkit.publicUrl = `${baseUrl}/${ldkitSchemaFilename}`;
    // ldkit.psm = psmSchemaIri;
    // ldkit.configuration = configuration;
    // if ((dataSpecificationConfiguration.useGenerators?.["LDkit"] ?? false) !== false) {
    //     artifacts.push(ldkit);
    // }

    return artifacts;
}
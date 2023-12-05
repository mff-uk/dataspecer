import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model/data-specification-artefact";
import { DataSpecificationSchema } from "@dataspecer/core/data-specification/model/data-specification-schema";
import { XML_SCHEMA } from "@dataspecer/xml/xml-schema";
import { JSON_SCHEMA } from "@dataspecer/json/json-schema";
import { JSON_LD_GENERATOR } from "@dataspecer/json/json-ld";
import { XSLT_LIFTING, XSLT_LOWERING } from "@dataspecer/xml/xml-transformations";
import { SPARQL } from "@dataspecer/sparql-query";
import { CSV_SCHEMA } from "@dataspecer/csv/csv-schema";
import { XmlConfigurator } from "@dataspecer/xml/configuration";
import { XML_COMMON_SCHEMA_GENERATOR } from "@dataspecer/xml/xml-common-schema";
import {RDF_TO_CSV} from "@dataspecer/csv/rdf-to-csv";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import {JsonExampleGenerator} from "@dataspecer/json-example";

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

    const artifacts: DataSpecificationArtefact[] = [];

    const jsonSchema = new DataSpecificationSchema();
    jsonSchema.iri = `${psmSchemaIri}#jsonschema`;
    jsonSchema.outputPath = `${basePath}/schema.json`;
    jsonSchema.publicUrl = `${baseUrl}/schema.json`;
    jsonSchema.generator = JSON_SCHEMA.Generator;
    jsonSchema.psm = psmSchemaIri;
    jsonSchema.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["json"] !== false) {
        artifacts.push(jsonSchema);
    }

    const jsonExample = new DataSpecificationSchema();
    jsonExample.iri = `${psmSchemaIri}#jsonExample`;
    jsonExample.outputPath = `${basePath}/example.json`;
    jsonExample.publicUrl = `${baseUrl}/example.json`;
    jsonExample.generator = JsonExampleGenerator.IDENTIFIER;
    jsonExample.psm = psmSchemaIri;
    jsonExample.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["json"] !== false) {
        artifacts.push(jsonExample);
    }

    const jsonLd = new DataSpecificationSchema();
    jsonLd.iri = `${psmSchemaIri}#jsonLd`;
    jsonLd.outputPath = `${basePath}/context.jsonld`;
    jsonLd.publicUrl = `${baseUrl}/context.jsonld`;
    jsonLd.generator = JSON_LD_GENERATOR;
    jsonLd.psm = psmSchemaIri;
    jsonLd.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["json"] !== false) {
        artifacts.push(jsonLd);
    }

    const xmlSchemaLocation = XmlConfigurator.getFromObject(configuration).commonXmlSchemaExternalLocation;
    const xsdCoreSchema = new DataSpecificationSchema();
    xsdCoreSchema.iri = "https://schemas.dataspecer.com/xsd/core/2022-07.xsd"; // Real URL as IRI
    xsdCoreSchema.outputPath = xmlSchemaLocation ? null : `${basePath}/2022-07.xsd`;
    xsdCoreSchema.publicUrl = xmlSchemaLocation ?? `${baseUrl}/2022-07.xsd`;
    xsdCoreSchema.generator = XML_COMMON_SCHEMA_GENERATOR;
    xsdCoreSchema.psm = psmSchemaIri;
    xsdCoreSchema.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["xml"] !== false) {
        artifacts.push(xsdCoreSchema);
    }

    const xmlSchema = new DataSpecificationSchema();
    xmlSchema.iri = `${psmSchemaIri}#xmlschema`;
    xmlSchema.outputPath = `${basePath}/schema.xsd`;
    xmlSchema.publicUrl = `${baseUrl}/schema.xsd`;
    xmlSchema.generator = XML_SCHEMA.Generator;
    xmlSchema.psm = psmSchemaIri;
    xmlSchema.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["xml"] !== false) {
        artifacts.push(xmlSchema);
    }

    const xsltLifting = new DataSpecificationSchema();
    xsltLifting.iri = `${psmSchemaIri}#xsltlifting`;
    xsltLifting.outputPath = `${basePath}/lifting.xslt`;
    xsltLifting.publicUrl = `${baseUrl}/lifting.xslt`;
    xsltLifting.generator = XSLT_LIFTING.Generator;
    xsltLifting.psm = psmSchemaIri;
    xsltLifting.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["xml"] !== false) {
        artifacts.push(xsltLifting);
    }

    const xsltLowering = new DataSpecificationSchema();
    xsltLowering.iri = `${psmSchemaIri}#xsltlowering`;
    xsltLowering.outputPath = `${basePath}/lowering.xslt`;
    xsltLowering.publicUrl = `${baseUrl}/lowering.xslt`;
    xsltLowering.generator = XSLT_LOWERING.Generator;
    xsltLowering.psm = psmSchemaIri;
    xsltLowering.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["xml"] !== false) {
        artifacts.push(xsltLowering);
    }

    const csvSchema = new DataSpecificationSchema();
    csvSchema.iri = `${psmSchemaIri}#csvschema`;
    csvSchema.outputPath = `${basePath}/schema.csv-metadata.json`;
    csvSchema.publicUrl = `${baseUrl}/schema.csv-metadata.json`;
    csvSchema.generator = CSV_SCHEMA.Generator;
    csvSchema.psm = psmSchemaIri;
    csvSchema.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["csv"] !== false) {
        artifacts.push(csvSchema);
    }

    const rdfToCsv = new DataSpecificationSchema();
    rdfToCsv.iri = `${psmSchemaIri}#rdfToCsv`;
    rdfToCsv.outputPath = `${basePath}/rdf-to-csv/`;
    rdfToCsv.publicUrl = `${baseUrl}/rdf-to-csv/`;
    rdfToCsv.generator = RDF_TO_CSV.Generator;
    rdfToCsv.psm = psmSchemaIri;
    rdfToCsv.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["csv"] !== false) {
        artifacts.push(rdfToCsv);
    }

    const sparqlSchema = new DataSpecificationSchema();
    sparqlSchema.iri = `${psmSchemaIri}#sparqlschema`;
    sparqlSchema.outputPath = `${basePath}/query.sparql`;
    sparqlSchema.publicUrl = `${baseUrl}/query.sparql`;
    sparqlSchema.generator = SPARQL.Generator;
    sparqlSchema.psm = psmSchemaIri;
    sparqlSchema.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["sparql"] !== false) {
        artifacts.push(sparqlSchema);
    }

    const shacl = new DataSpecificationSchema();
    shacl.iri = `${psmSchemaIri}#shacl`;
    shacl.outputPath = `${basePath}/shacl-shapes.ttl`;
    shacl.publicUrl = `${baseUrl}/shacl-shapes.ttl`;
    shacl.generator = "https://schemas.dataspecer.com/generator/shacl";
    shacl.psm = psmSchemaIri;
    shacl.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["shacl"] !== false) {
        artifacts.push(shacl);
    }

    const shex = new DataSpecificationSchema();
    shex.iri = `${psmSchemaIri}#shex`;
    shex.outputPath = `${basePath}/validation.shex`;
    shex.publicUrl = `${baseUrl}/validation.shex`;
    shex.generator = "https://schemas.dataspecer.com/generator/shex";
    shex.psm = psmSchemaIri;
    shex.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["shacl"] !== false) {
        artifacts.push(shex);
    }

    const openapi = new DataSpecificationSchema();
    openapi.iri = `${psmSchemaIri}#openapi`;
    openapi.outputPath = `${basePath}/openapi-specification.yaml`;
    openapi.publicUrl = `${baseUrl}/openapi-specification.yaml`;
    openapi.generator = "https://schemas.dataspecer.com/generator/openapi";
    openapi.psm = psmSchemaIri;
    openapi.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["openapi"] !== false) {
        artifacts.push(openapi);
    }

    return artifacts;
}

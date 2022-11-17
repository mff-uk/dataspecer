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

/**
 * This is the place to register your own artefacts if you need to.
 */
export function getSchemaArtifacts(
    psmSchemaIri: string,
    baseUrl: string,
    basePath: string,
    configuration: object
) {
    const artifacts: DataSpecificationArtefact[] = [];

    const jsonSchema = new DataSpecificationSchema();
    jsonSchema.iri = `${psmSchemaIri}#jsonschema`;
    jsonSchema.outputPath = `${basePath}/schema.json`;
    jsonSchema.publicUrl = baseUrl + jsonSchema.outputPath;
    jsonSchema.generator = JSON_SCHEMA.Generator;
    jsonSchema.psm = psmSchemaIri;
    jsonSchema.configuration = configuration;
    artifacts.push(jsonSchema);

    const jsonLd = new DataSpecificationSchema();
    jsonLd.iri = `${psmSchemaIri}#jsonLd`;
    jsonLd.outputPath = `${basePath}/context.jsonld`;
    jsonLd.publicUrl = baseUrl + jsonLd.outputPath;
    jsonLd.generator = JSON_LD_GENERATOR;
    jsonLd.psm = psmSchemaIri;
    jsonLd.configuration = configuration;
    artifacts.push(jsonLd);

    const xmlSchemaLocation = XmlConfigurator.getFromObject(configuration).commonXmlSchemaExternalLocation;
    const xsdCoreSchema = new DataSpecificationSchema();
    xsdCoreSchema.iri = "https://schemas.dataspecer.com/xsd/core/2022-07.xsd"; // Real URL as IRI
    xsdCoreSchema.outputPath = xmlSchemaLocation ? null : `${basePath}/2022-07.xsd`;
    xsdCoreSchema.publicUrl = xmlSchemaLocation ?? (baseUrl + xsdCoreSchema.outputPath);
    xsdCoreSchema.generator = XML_COMMON_SCHEMA_GENERATOR;
    xsdCoreSchema.psm = psmSchemaIri;
    xsdCoreSchema.configuration = configuration;
    artifacts.push(xsdCoreSchema);

    const xmlSchema = new DataSpecificationSchema();
    xmlSchema.iri = `${psmSchemaIri}#xmlschema`;
    xmlSchema.outputPath = `${basePath}/schema.xsd`;
    xmlSchema.publicUrl = baseUrl + xmlSchema.outputPath;
    xmlSchema.generator = XML_SCHEMA.Generator;
    xmlSchema.psm = psmSchemaIri;
    xmlSchema.configuration = configuration;
    artifacts.push(xmlSchema);

    const xsltLifting = new DataSpecificationSchema();
    xsltLifting.iri = `${psmSchemaIri}#xsltlifting`;
    xsltLifting.outputPath = `${basePath}/lifting.xslt`;
    xsltLifting.publicUrl = baseUrl + xsltLifting.outputPath;
    xsltLifting.generator = XSLT_LIFTING.Generator;
    xsltLifting.psm = psmSchemaIri;
    xsltLifting.configuration = configuration;
    artifacts.push(xsltLifting);

    const xsltLowering = new DataSpecificationSchema();
    xsltLowering.iri = `${psmSchemaIri}#xsltlowering`;
    xsltLowering.outputPath = `${basePath}/lowering.xslt`;
    xsltLowering.publicUrl = baseUrl + xsltLowering.outputPath;
    xsltLowering.generator = XSLT_LOWERING.Generator;
    xsltLowering.psm = psmSchemaIri;
    xsltLowering.configuration = configuration;
    artifacts.push(xsltLowering);

    const csvSchema = new DataSpecificationSchema();
    csvSchema.iri = `${psmSchemaIri}#csvschema`;
    csvSchema.outputPath = `${basePath}/schema.csv-metadata.json`;
    csvSchema.publicUrl = baseUrl + csvSchema.outputPath;
    csvSchema.generator = CSV_SCHEMA.Generator;
    csvSchema.psm = psmSchemaIri;
    csvSchema.configuration = configuration;
    artifacts.push(csvSchema);

    const sparqlSchema = new DataSpecificationSchema();
    sparqlSchema.iri = `${psmSchemaIri}#sparqlschema`;
    sparqlSchema.outputPath = `${basePath}/query.sparql`;
    sparqlSchema.publicUrl = baseUrl + sparqlSchema.outputPath;
    sparqlSchema.generator = SPARQL.Generator;
    sparqlSchema.psm = psmSchemaIri;
    sparqlSchema.configuration = configuration;
    artifacts.push(sparqlSchema);

    return artifacts;
}

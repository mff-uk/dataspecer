import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator/artefact-generator-context";
import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model/data-specification-artefact";
import { DataSpecificationDocumentation } from "@dataspecer/core/data-specification/model";
import { MemoryStreamDictionary } from "@dataspecer/core/io/stream/memory-stream-dictionary";
import { PackageContext } from "./views";
import { TemplateArtifactGenerator } from "..";

// TODO: This is temporary workaroud for mapping artefacts to text.

const artefactTitle = {
    "http://example.com/generator/json-schema": {
        cs: "JSON schéma",
        en: "JSON schema",
    },
    "http://dataspecer.com/generator/json-ld": {
        cs: "JSON-LD kontext",
        en: "JSON-LD context",
    },
    "http://example.com/generator/xml-common-schema": {
        cs: "XML sdílené koncepty",
        en: "XML shared concepts",
    },
    "http://example.com/generator/xml-schema": {
        cs: "XML schéma",
        en: "XML schema",
    },
    "http://example.com/generator/xslt-lifting": {
        cs: "XSLT lifting",
        en: "XSLT lifting",
    },
    "http://example.com/generator/xslt-lowering": {
        cs: "XSLT lowering",
        en: "XSLT lowering",
    },
    "http://example.com/generator/csv-schema": {
        cs: "CSV schéma",
        en: "CSV schema",
    },
    "http://example.com/generator/rdf-to-csv": {
        cs: "RDF to CSV",
        en: "RDF to CSV",
    },
    "http://example.com/generator/sparql": {
        cs: "SPARQL",
        en: "SPARQL",
    },
    "plant-uml": {
        cs: "PlantUML diagram",
        en: "PlantUML diagram",
    },
    "plant-uml/image": {
        cs: "Konceptuální diagram",
        en: "Conceptual diagram",
    },
    "http://example.com/generator/bikeshed": {
        cs: "Bikeshed dokumentace zdroj",
        en: "Bikeshed documentation source",
    },
    "http://example.com/generator/bikeshed/html-output": {
        cs: "Bikeshed dokumentace",
        en: "Bikeshed documentation",
    }
};

export function prepareArtifacts(
    view: object,
    context: PackageContext,
) {
    return {...view, ...getArtifactsView(context, context.specification.artefacts.map(a => a.iri))};
}

export function getArtifactsView(
    context: PackageContext,
    artifactIds: string[],
) {
    const baseUrl = context.artefact.publicUrl;

    const artifacts = context.specification.artefacts.filter(a => artifactIds.includes(a.iri)).map(artifact => ({
        ...artifact,
        relativePath: pathRelative(baseUrl, artifact.publicUrl),
        title: artefactTitle[artifact.generator]?.["cs"] ?? "",
        getArtifact: async () => {
            const stream = new MemoryStreamDictionary();
            const generator = await context.context.createGenerator(artifact.generator);
            await generator.generateToStream(context.context, artifact, context.specification, stream);
            const files = await stream.list();
            const result = [];
            for (const file of files) {
                result.push({
                    name: file,
                    content: await stream.readPath(file).read(),
                });
            }
            return result;
        },
        getDocumentation: async () => {
            const generator = await context.context.createGenerator(artifact.generator);
            return await generator.generateForDocumentation(
                context.context,
                artifact,
                context.specification,
                TemplateArtifactGenerator.IDENTIFIER,
                {artifact: context.artefact}
            );
        },
    }));

    const artifact = Object.fromEntries(artifacts.map(a => [a.generator.split("/").pop(), a]));

    return {artifacts, artifact};
}
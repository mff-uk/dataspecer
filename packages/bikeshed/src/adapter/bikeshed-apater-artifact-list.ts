import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { DataSpecificationDocumentation } from "@dataspecer/core/data-specification/model/data-specification-documentation";
import { BikeshedContent, BikeshedContentSection, BikeshedContentText } from "../bikeshed-model";
import { BikeshedAdapterContext } from "./bikeshed-adapter-context";

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

export async function artifactsToBikeshedContent(
    context: BikeshedAdapterContext,
    specification: DataSpecification,
    sourceArtefact: DataSpecificationDocumentation,
): Promise<BikeshedContent> {
    const result = new BikeshedContentSection(
        context.i18n.t("artifacts:title"),
        context.i18n.t("artifacts:anchor")
    );

    result.content.push(new BikeshedContentText(context.i18n.t("artifacts:info")));


    const baseUrl = sourceArtefact.publicUrl;

    let table = ``;
    table += `<table class="def">\n`;
    table += `\t<thead>\n`;
    table += `\t\t<tr><th>${context.i18n.t("artifacts:table.artifact")}</th><th>${context.i18n.t("artifacts:table.link")}</th></tr>\n`;
    table += `\t</thead>\n`;
    table += `\t<tbody>\n`;

    for (const artefact of specification.artefacts) {
        const url = pathRelative(baseUrl, artefact.publicUrl);
        const title = artefactTitle[artefact.generator]?.[context.i18n.language] ?? "";
        table += `\t\t<tr><td>${title}</td><td><a href="${url}">${url}</a></td></tr>\n`;
    }

    table += `\t</tbody>\n`;
    table += `</table>\n`;


    result.content.push(new BikeshedContentText(table));

    return result;
}
// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultTemplateArtifactBikeshedConfiguration =  {
    template: `<pre class='metadata'>
{{>metadata}}

</pre>

{{>abstract}}

{{>artifactList}}

{{>conceptualModel}}

{{#structureModels}}
# {{#humanLabel}}{{translate}}{{/humanLabel}}
{{#humanDescription}}{{translate}}{{/humanDescription}}
{{#artifacts}}{{#getDocumentation}}{{#useTemplate}}{{/useTemplate}}{{/getDocumentation}}{{/artifacts}}
{{/structureModels}}` as string,

    /**
     * Pre-defined list of named templates that can be used in the main template
     * as partials - for example {{>abstract}}. All templates have access to the
     * same data as the main template
     */
    templates: {
        metadata: `Title : {{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}
Shortname : {{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}
Status : LS 
Editor : Dataspecer editor, https://dataspecer.com/ 
Boilerplate : conformance no, copyright no 
Abstract : This document was generated automatically by [Dataspecer](https://dataspecer.com/). 
Markup Shorthands : markdown yes
TR: https://ofn.gov.cz/
Previous Version: https://ofn.gov.cz/
Repository: datagov-cz/otevrene-formalni-normy`,
        abstract: ``,
        artifactList: `# Seznam artefaktů # {#seznam-artefaktu}
Tato sekce obsahuje odkaz na všechny soubory, které jsou součástí této dokumentace.
<table class="def">
    <thead>
        <tr><th>Artefakt</th><th>Odkaz</th></tr>
    </thead>
    <tbody>
        {{#artifacts}}
        <tr><td>{{title}}</td><td><a href="{{{relativePath}}}">{{{relativePath}}}</a></td></tr>
        {{/artifacts}}
    </tbody>
</table>`,
        conceptualModel: `# Konceptuální model # {#konceptualni-model}
V této sekci je definován konceptuální model.

<figure><img src="{{#artifact.image.publicUrl}}{{{relativePath}}}{{/artifact.image.publicUrl}}"><figcaption>Diagram konceptuálního modelu.</figcaption></figure>

{{#semanticModels}}
{{#classes}}
## {{#humanLabel}}{{translate}}{{/humanLabel}} ## {#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}}
{{#humanDescription}}{{#translate}}
: Popis
:: {{.}}
{{/translate}}{{/humanDescription}}
: Význam
:: Typ {{#humanLabel}}{{translate}}{{/humanLabel}} je definován v sémantickém slovníku pojmů jako [{{#humanLabel}}{{translate}}{{/humanLabel}}]({{{cimIri}}}).

{{#properties}}
### {{#dataTypes}}{{#isAssociation}}Vztah (asociace): {{/isAssociation}}{{/dataTypes}}{{#humanLabel}}{{translate}}{{/humanLabel}} ### {#{{#humanLabel}}{{#translate}}conceptual-property-{{sanitizeLink}}{{/translate}}{{/humanLabel}}}
: Jméno
:: {{#humanLabel}}{{translate}}{{/humanLabel}}
{{#humanDescription}}{{#translate}}
: Popis
:: {{.}}
{{/translate}}{{/humanDescription}}
: Povinnost
:: {{#cardinalityIsRequired}}povinné{{/cardinalityIsRequired}}{{^cardinalityIsRequired}}nepovinné{{/cardinalityIsRequired}}
: Kardinalita
:: {{cardinalityRange}}
{{#dataTypes}}{{#isAssociation}}
: Typ
{{#class}}:: [{{#humanLabel}}{{translate}}{{/humanLabel}}](#{{#humanLabel}}{{#translate}}conceptual-class-{{sanitizeLink}}{{/translate}}{{/humanLabel}}){{/class}}
{{/isAssociation}}{{/dataTypes}}
: Význam
:: Vlastnost {{#humanLabel}}{{translate}}{{/humanLabel}} je definován v sémantickém slovníku pojmů jako [{{#humanLabel}}{{translate}}{{/humanLabel}}]({{{cimIri}}}).

{{/properties}}
{{/classes}}
{{/semanticModels}}`,
    } as Record<string, string>,
}

export const DefaultTemplateArtifactConfiguration = {
    // @ts-ignore
    type: "respec" as const,
    template: `<!DOCTYPE html>
<html lang="cs">
    <head>
        <title>{{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}</title>
        <meta content="text/html; charset=utf-8" http-equiv="content-type" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <meta name="theme-color" content="#057fa5">
        <meta name="msapplication-TileColor" content="#057fa5">
        <meta name="msapplication-TileImage" content="https://ofn.gov.cz/static/favicons/ms-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="57x57" href="https://ofn.gov.cz/static/favicons/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="https://ofn.gov.cz/static/favicons/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="https://ofn.gov.cz/static/favicons/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="https://ofn.gov.cz/static/favicons/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="https://ofn.gov.cz/static/favicons/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="https://ofn.gov.cz/static/favicons/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="https://ofn.gov.cz/static/favicons/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="https://ofn.gov.cz/static/favicons/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="https://ofn.gov.cz/static/favicons/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="https://ofn.gov.cz/static/favicons/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="https://ofn.gov.cz/static/favicons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="https://ofn.gov.cz/static/favicons/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="https://ofn.gov.cz/static/favicons/favicon-16x16.png">
        <link rel="manifest" href="https://ofn.gov.cz/static/favicons/manifest.json">
        <script class="remove" src="https://ofn.gov.cz/static/js/respec-odcz.js"></script>
        <script class="remove">
            var respecConfig = {{>metadata}};
        </script>
    </head>
    <body>
    
{{>abstract}}

{{>artifactList}}

{{>conceptualModel}}

{{#structureModels}}
<section>
<h2>Specifikace struktury pro {{#humanLabel}}{{translate}}{{/humanLabel}}</h2>
<p>{{#humanDescription}}{{translate}}{{/humanDescription}}</p>

{{#artifacts}}{{#getDocumentation}}{{#useTemplate}}{{/useTemplate}}{{/getDocumentation}}{{/artifacts}}
</section>
{{/structureModels}}

    </body>
</html>`,
    templates: {
        metadata: `{
            specStatus: "REC",
            thisVersion: "{{{artifact.template-artifact.publicUrl}}}",
            latestVersion: "{{{artifact.template-artifact.publicUrl}}}",
            shortName: "{{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}",
            showPreviousVersion: false,
            editors: [],
          }`,
        abstract: `<section id="abstract" class="introductory">
    <h2>Abstrakt</h2>
    <p>
        Tento dokument byl vygenerován automaticky nástrojem <a href="https://dataspecer.com/">Dataspecer</a>.
    </p>
</section>`,
        artifactList: `<section>
    <h2>Seznam artefaktů</h2>
    Tato sekce obsahuje odkaz na všechny soubory, které jsou součástí této dokumentace.
    <table class="def">
        <thead>
            <tr><th>Artefakt</th><th>Odkaz</th></tr>
        </thead>
        <tbody>
            {{#artifacts}}
            <tr><td>{{title}}</td><td><a href="{{{relativePath}}}">{{{relativePath}}}</a></td></tr>
            {{/artifacts}}
        </tbody>
    </table>
</section>`,
        conceptualModel: `<section>
<h2>Konceptuální model</h2>
V této sekci jsou definovány veškeré koncepty, třídy a asociace, potřebné pro <i>{{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}</i>.

<figure><img src="{{#artifact.image.publicUrl}}{{{relativePath}}}{{/artifact.image.publicUrl}}"><figcaption>Diagram konceptuálního modelu.</figcaption></figure>

{{#semanticModels}}
{{#classes}}
<section id="{{semanticModelLinkId}}">
<h3>{{#humanLabel}}{{translate}}{{/humanLabel}}</h3>
<dl>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{.}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Význam</dt>
<dd>Koncept {{#humanLabel}}{{translate}}{{/humanLabel}} je definován v <a href="https://slovník.gov.cz/">sémantickém slovníku pojmů</a> jako <a href="{{{cimIri}}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>.</dd>
{{#extends}}
<dt>Nadřazený typ</dt>
<dd><a href="#{{semanticModelLinkId}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a></dd>
{{/extends}}
</dl>

{{#properties}}
<section id="{{semanticModelLinkId}}">
<h4>{{#dataTypes}}{{#isAssociation}}Vztah (asociace): {{/isAssociation}}{{/dataTypes}}{{#humanLabel}}{{translate}}{{/humanLabel}}</h4>
<dl>
<dt>Jméno</dt>
<dd>{{#humanLabel}}{{translate}}{{/humanLabel}}</dd>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{.}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Povinnost</dt>
<dd>{{#cardinalityIsRequired}}povinné{{/cardinalityIsRequired}}{{^cardinalityIsRequired}}nepovinné{{/cardinalityIsRequired}}</dd>
<dt>Kardinalita</dt>
<dd>{{cardinalityRange}}</dd>
{{#dataTypes}}{{#isAssociation}}
<dt>Typ</dt>
<dd>{{#class}}<a href="#{{semanticModelLinkId}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>{{/class}}</dd>
{{/isAssociation}}{{/dataTypes}}
<dt>Význam</dt>
<dd>Koncept {{#humanLabel}}{{translate}}{{/humanLabel}} je definován v <a href="https://slovník.gov.cz/">sémantickém slovníku pojmů</a> jako <a href="{{{cimIri}}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>.</dd>
</section>
{{/properties}}
</section>
{{/classes}}
{{/semanticModels}}

</section>`,
    },
};

export type TemplateArtifactConfiguration = typeof DefaultTemplateArtifactConfiguration;

export interface ConfigurationWithTemplateArtifact {
    [TemplateArtifactConfigurator.KEY]?: DeepPartial<TemplateArtifactConfiguration>;
}

export class TemplateArtifactConfigurator {
    static KEY = "template-artifact" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<TemplateArtifactConfiguration> {
        return configurationObject?.[TemplateArtifactConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<TemplateArtifactConfiguration>): ConfigurationWithTemplateArtifact {
        return {...configurationObject, [TemplateArtifactConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<TemplateArtifactConfiguration>[]): DeepPartial<TemplateArtifactConfiguration> {
        let result: DeepPartial<TemplateArtifactConfiguration> = {};
        for (const option of options) {
            result = {
                ...result,
                ...option,
                templates: {
                    ...result.templates,
                    ...option.templates
                }
            };
        }

        return result;
    }

    static getDefault() {
        return DefaultTemplateArtifactConfiguration;
    }
}

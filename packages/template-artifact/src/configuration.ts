// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultTemplateArtifactConfiguration =  {
    template: `<pre class='metadata'>
Title : {{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}
Shortname : {{#semanticModels}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModels}}
Status : LS 
Editor : Dataspecer editor, https://dataspecer.com/ 
Boilerplate : conformance no, copyright no 
Abstract : This document was generated automatically by [Dataspecer](https://dataspecer.com/). 
Markup Shorthands : markdown yes 
Logo : https://ofn.gov.cz/static/images/logo.png 
</pre>

# Seznam artefaktů # {#seznam-artefaktu}
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

# Konceptuální model # {#konceptualni-model}
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
{{/semanticModels}}

{{#structureModels}}
# {{#humanLabel}}{{translate}}{{/humanLabel}}
{{#humanDescription}}{{translate}}{{/humanDescription}}
{{#artifacts}}{{#getDocumentation}}{{#useTemplate}}{{/useTemplate}}{{/getDocumentation}}{{/artifacts}}
{{/structureModels}}
` as string,



    /**
     * Pre-defined list of named templates that can be used in the main template
     * as partials - for example {{>abstract}}. All templates have access to the
     * same data as the main template
     */
    templates: {
        test: `This is a test template with {{name}}.` as string,
    } as Record<string, string>,
}

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
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultTemplateArtifactConfiguration;
    }
}

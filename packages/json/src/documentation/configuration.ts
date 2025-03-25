export const MAIN_JSON_PARTIAL = "json-documentation";

export const defaultJsonPartials: Record<string, string> = {
  [MAIN_JSON_PARTIAL]: `<section>
<h3>Přehled JSON struktury</h3>
<p>JSON Schéma zachycující strukturu pro <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i> je definováno v souboru <a href="{{{artifact.json-schema.relativePath}}}"><code>{{artifact.json-schema.relativePath}}</code></a>. {{{infoText}}} <i>{{#structureModel}}{{#roots}}{{#classes}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/classes}}{{/roots}}{{/structureModel}}</i>.{{{infoText2}}}</p>

<ul>
{{#classes}}{{#inThisSchema}}
<li>
  <a href="#{{structureModelLinkId}}">
    {{#humanLabel}}{{translate}}{{/humanLabel}}
  </a>
<ul>
{{#properties}}
<li>
    <code>{{technicalLabel}}</code>:
    {{#if cardinalityIsRequired}}povinná{{else}}nepovinná{{/if}}
    ({{cardinalityRange}}) položka typu {{#dataTypes}}
      {{#isAssociation}}{{#dataType}}{{#isSimpleClass}}<strong>IRI (<a href="{{#pimClass}}{{href pimIri}}{{/pimClass}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>)</strong>{{/isSimpleClass}}{{^isSimpleClass}}<strong><a href="#{{structureModelLinkId}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a></strong>{{/isSimpleClass}}{{/dataType}}{{/isAssociation}}
      {{#isAttribute}} {{#dataType}}<a href="{{{.}}}">{{translate (getLabelForDataType .)}}</a>{{#regex}} dle regulárního výrazu <code>{{{.}}}</code>{{/regex}}{{/dataType}}{{^dataType}}bez datového typu{{/dataType}}{{/isAttribute}}
    {{/dataTypes}}
</li>
{{/properties}}
</ul>
</li>
{{/inThisSchema}}{{/classes}}
</ul>

{{#classes}}{{#inThisSchema}}
<section id="{{structureModelLinkId}}">
<h3>Objekt <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i></h3>
<dl>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{translation}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Interpretace</dt>
{{#pimClass}}
<dd>
  <a href="{{href pimIri}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>
</dd>
{{/pimClass}}
</dl>

{{#properties}}
<section id="{{structureModelLinkId}}">
<h5>Vlastnost <code>{{technicalLabel}}</code></h5>
<dl>
<dt>Klíč</dt>
<dd>\`{{technicalLabel}}\`</dd>
<dt>Jméno</dt>
<dd>{{#humanLabel}}{{translate}}{{/humanLabel}}</dd>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{translation}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Povinnost</dt>
<dd>{{#if cardinalityIsRequired}}povinné{{else}}nepovinné{{/if}}</dd>
<dt>Kardinalita</dt>
<dd>{{cardinalityRange}}</dd>
<dt>Typ</dt>
{{#dataTypes}}

{{#isAssociation}}
{{#dataType}}
{{#isSimpleClass}}
<dd>
  IRI (<a href="{{#pimClass}}{{href pimIri}}{{/pimClass}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>)
</dd>
{{/isSimpleClass}}
{{^isSimpleClass}}
<dd>
  <a href="{{externalDocumentation}}#{{#dataType}}{{structureModelLinkId}}{{/dataType}}">{{#dataType.humanLabel}}{{translate}}{{/dataType.humanLabel}}</a>
</dd>
{{/isSimpleClass}}
{{/dataType}}
{{/isAssociation}}

{{#isAttribute}}
<dd>
{{#dataType}}<a href="{{{.}}}">{{translate (getLabelForDataType .)}}</a>{{/dataType}}{{^dataType}}bez datového typu{{/dataType}}
</dd>
{{/isAttribute}}

{{/dataTypes}}

{{#dataTypes}}{{#isAttribute}}{{#example}}
<dt>Příklad</dt>
<dd><div>{{.}}</div></dd>
{{/example}}{{/isAttribute}}{{/dataTypes}}

{{#dataTypes}}{{#isAttribute}}{{#regex}}
<dt>Regulární výraz</dt>
<dd><code>{{.}}</code></dd>
{{/regex}}{{/isAttribute}}{{/dataTypes}}

<dt>Interpretace</dt>
{{#pimAssociation}}
<dd>
<a href="{{href pimIri}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>
</dd>
{{/pimAssociation}}
</dl>
</section>
{{/properties}}

</section>
{{/inThisSchema}}{{/classes}}

{{#classes}}{{#isFromExternalSchema}}
<section id="{{structureModelLinkId}}">
<h3>Referencovaný objekt <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i></h3>
<dl>
{{#humanDescription}}{{#translate}}
<dt>Popis</dt>
<dd>{{translation}}</dd>
{{/translate}}{{/humanDescription}}
<dt>Interpretace</dt>
{{#pimClass}}
<dd>
  <a href="{{href pimIri}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a>
</dd>
{{/pimClass}}
{{#classSpecificationArtifact}}
<dt>Schéma</dt>
<dd>
  Schéma je definováno v  <a href="{{link}}">{{#semanticModel}}{{#humanLabel}}{{translate}}{{/humanLabel}}{{/semanticModel}}</a>.
</dd>
{{/classSpecificationArtifact}}
</dl>
</section>
{{/isFromExternalSchema}}{{/classes}}
</section>`,
};

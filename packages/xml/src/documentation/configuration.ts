export const MAIN_XML_PARTIAL = "xml-documentation";

export const defaultXmlPartials: Record<string, string> = {
  [MAIN_XML_PARTIAL]: `{{#def "xml-meaning" "annotation"}}
  {{#if (or (get-semantic-class annotation) (non-empty annotation.metaTitle) (non-empty annotation.metaDescription))}}
    <dt>Význam</dt>
    {{#if (or (non-empty annotation.metaTitle) (non-empty annotation.metaDescription))}}
      <dd>
        <a href="{{#get-semantic-class annotation}}{{href pimIri}}{{/get-semantic-class}}">{{translate annotation.metaTitle}}</a>
        {{#if (non-empty annotation.metaDescription)}}({{translate annotation.metaDescription}}){{/if}}
      </dd>
    {{/if}}
  {{/if}}
{{/def}}

{{#def "xml-qname" "name"}}{{#if name.[0]}}{{name.[0]}}:{{/if}}{{name.[1]}}{{/def}}

{{#def "xml-content-type" "type"}}
{{#if (equals type "choice")}} - výběr jednoho elementu z množiny{{/if}}
{{#if (equals type "sequence")}} - elementy v tomto pořadí{{/if}}
{{/def}}

{{#def "xml-schema-complex-content" "contents"}}
  <ul style="margin-top: 0;">
    {{#contents}}
      <li>
        {{#if element}}
          element <a href="{{xml-href element}}"><code>&lt;{{element.name.[1]}}&gt;</code></a> [{{cardinalityMin}}..{{#if cardinalityMax}}{{cardinalityMax}}{{else}}*{{/if}}]
        {{/if}}
        {{#item}}
          {{#if (equals xsType "group")}}
            skupina
            {{#if referencesStructure}}
              referencující
            {{/if}}
            <a href="{{xml-href name type="element" structure=referencesStructure}}"><code>{{xml-qname name}}</code></a> [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
            {{else}}
            {{#if (or (equals xsType "sequence") (equals xsType "choice") )}}
              {{#if (equals xsType "sequence")}}sekvence{{/if}}{{#if (equals xsType "choice")}}výběr jednoho prvku{{/if}} [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
              <ul>
                {{xml-schema-complex-content contents}}
              </ul>
              {{else}}
                {{xml-type}} [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
            {{/if}}
          {{/if}}
        {{/item}}
      </li>
    {{/contents}}
  </ul>
{{/def}}

{{#def "xml-complex-definition" "complexDefinition"}}
  {{#if complexDefinition.contents}}
    <dt>Obsah {{xml-content-type complexDefinition.xsType}}</dt>
    {{xml-schema-complex-content complexDefinition.contents}}
  {{/if}}
{{/def}}

{{#def "xml-type"}}
  <div style="margin-left: 40px;">
    {{#if (and (not simpleDefinition) (not complexDefinition))}}
      <dt>Obsah</dt>
      <dd>
        {{#if (equals name.[1] "langString")}}
          Obsahem elementue je <i>Řetězec s označením jazyka</i>.
        {{else}}
          Obsahem elementu je typ <a href="{{xml-href name}}"><code>{{xml-qname name}}</code></a>.
        {{/if}}
      </dd>
    {{/if}}

    {{#simpleDefinition}}
      <dt>Obsah</dt>
      {{#if (equals xsType "restriction")}}
        <dd>
        Obsahem elementu je jednoduchý typ <code>{{xml-qname base}}</code> s omezením na hodnoty dané regulárním výrazem <code>{{pattern}}</code>.
        </dd>
      {{else}}
        <dd>
          Obsahem elementu je jednoduchý typ <code>{{xml-qname xsType}}</code>.
        </dd>
      {{/if}}
    {{/simpleDefinition}}

    {{xml-meaning annotation}}

    {{#complexDefinition}}
      {{#if name}}
        <dt>Název</dt>
        <dd>
          <code>{{xml-qname name}}</code>
        </dd>
      {{/if}}
    {{/complexDefinition}}

    {{xml-complex-definition complexDefinition}}
  </div>
{{/def}}

<section>
<h3>Přehled XML struktury</h3>
<p>
  Tato sekce popisuje XSD zachycující strukturu pro <i>{{translate structureModel.humanLabel}}</i>, jež je definováno
  v souboru <a href="{{{structureModel.artifact.xml-schema.relativePath}}}"><code>{{structureModel.artifact.xml-schema.relativePath}}</code></a>.
</p>

{{#xmlSchema.targetNamespace}}
  <dl>
    <dt>Definováno v namespace</dt>
    <dd><code>{{.}}</code> (preferovaný prefix: <code>{{@root.xmlSchema.targetNamespacePrefix}}</code>)</dd>
  </dl>
{{/xmlSchema.targetNamespace}}

<section>
<h4>Importy</h4>
<p>
  Seznam schémat, jež jsou tímto schématem importovány a použity.
</p>
{{#if imports}}
  <table class="def">
    <thead>
      <tr>
        <th>Prefix</th>
        <th>Namespace</th>
        <th>Lokace schématu</th>
        <th>Dokumentace</th>
      </tr>
    </thead>
    <tbody>
      {{#imports}}
        <tr>
          {{#if prefix}}
            <td><code></code>{{prefix}}</code></td>
            <td><a href="{{{namespace}}}">{{namespace}}</a></td>
          {{else}}
            <td colspan="2" style="text-align: center;"><i>Stejný namespace jako hlavní dokument</i></td>
          {{/if}}
          <td><a href="{{schemaLocation}}">{{schemaLocation}}</a></td>
          <td>{{#documentation}}<a href="{{link}}">{{translate semanticModel.humanLabel}}</a>{{/documentation}}</td>
        </tr>
      {{/imports}}
    </tbody>
  </table>
{{else}}
<i>Nic není importováno.</i>
{{/if}}
</section>

<section>
  <h4>Kořenové entity XSD schématu</h4>
  <ul>
    {{#xmlSchema.elements}}
      <li> element <a href="{{xml-href .}}"><code>{{xml-qname name}}</code></a></li>
    {{/xmlSchema.elements}}

    {{#xmlSchema.groups}}
      <li> skupina <a href="{{xml-href .}}"><code>{{name}}</code></a></li>
    {{/xmlSchema.groups}}

    {{#xmlSchema.types}}
      <li> {{#if complexDefinition}}komplexní{{/if}}{{#if simpleDefinition}}jednoduchý{{/if}} typ <a href="{{xml-href .}}"><code>{{xml-qname name}}</code></a></li>
    {{/xmlSchema.types}}
  </ul>
</section>



{{#def "xml-non-root-element" "element"}}
<section id="{{xml-id-anchor .}}">
  <h4>Element {{^name.[0]}}{{#path}}{{#if (equals entityType "element")}}<code>&lt;{{name.[1]}}&gt;</code> / {{/if}}{{/path}}{{/name.[0]}}<code>&lt;{{name.[1]}}&gt;</code></h4>

  <dl>
    <dt>Význam</dt>
    <dd>
      {{#each pathFromParentEntity}}
        <i>
          {{#if (equals type "class")}}odkazující na třídu{{/if}}
          {{#if (equals type "property")}}{{#if @first}}vlastnost{{else}}mající vlastnost{{/if}}{{/if}}
          {{#if (equals type "generalization")}}{{#if @first}}z obecnější třídy{{else}}mající obecnější třídu{{/if}}{{/if}}
          {{#if (equals type "specialization")}}{{#if @first}}z konkrétnější třídy{{else}}mající konkrétnější třídu{{/if}}{{/if}}
        </i>

        {{#with entity}}
          <a href="{{href pimIri}}"><strong>{{translate humanLabel}}</strong></a>
          {{#if (non-empty humanDescription)}}({{translate humanDescription}}){{/if}}
        {{/with}}

        {{#if (not @last)}}
          <span style="margin: 0 1rem">→</span>
        {{/if}}
      {{/each}}
    </dd>

    {{#effectiveCardinalityFromParentContainer}}
      <dt>Efektivní kardinalita elementu vůči nadřazeném elementu</dt>
      <dd>{{min}}..{{#if max}}{{max}}{{else}}*{{/if}}</dd>
    {{/effectiveCardinalityFromParentContainer}}
    {{#parentEntityInDocumentation}}
      <dt>Nadřazený element</dt>
      <dd><a href="{{xml-href .}}"></a></dd>
    {{/parentEntityInDocumentation}}

    {{#if type}}{{#with type}}
      <dt>Typ elementu</dt>
      {{xml-type}}
    {{/with}}{{else}}
      <i>Element nemá definovaný typ.</i>
    {{/if}}

    {{#if annotation.structureModelEntity.dataTypes.[0].example}}
      <dt>Příklady dat</dt>
      {{#each annotation.structureModelEntity.dataTypes.[0].example}}
        <dd>{{.}}</dd>
      {{/each}}
    {{/if}}
  </dl>
</section>
{{/def}}

{{#rootElements}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový element <code>&lt;{{name.[1]}}&gt;</code></h4>
  <dl>
    {{xml-meaning annotation}}

    {{#if type}}{{#with type}}
      <dt>Typ elementu</dt>
      {{xml-type}}
    {{/with}}{{else}}
      <dd><i>Element nemá definovaný typ.</i></dd>
    {{/if}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootElements}}

{{#rootGroups}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenová skupina {{#if name}}<code>{{name}}</code>{{else}}bez pojmenování{{/if}}</h4>
  <dl>
    {{xml-complex-definition definition}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootGroups}}

{{#rootTypes}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový {{#if complexDefinition}}komplexní{{/if}}{{#if simpleDefinition}}jednoduchý{{/if}} typ {{#if name}}<code>{{xml-qname name}}</code>{{else}}bez pojmenování{{/if}}</h4>
  <dl>
    {{xml-meaning annotation}}

    {{xml-complex-definition complexDefinition}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootTypes}}

</section>`,
};

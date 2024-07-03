import { DocumentationGeneratorConfiguration } from "./generator";

export const defaultConfiguration: DocumentationGeneratorConfiguration = {
  template: `<!DOCTYPE html>
  {{#def "class"}}<a href="{{{href id}}}">{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}</a>{{/def}}
  <html>
    <head>
      <meta charset="utf-8" />
      <title>{{translate package.userMetadata.label}}</title>
      <meta name="color-scheme" content="light dark">
      <script type="application/ld+json">
        {{{json dsv}}}
      </script>
      <script
        src="https://www.w3.org/Tools/respec/respec-w3c"
        class="remove"
        defer
      ></script>
      <script class="remove">
        // All config options at https://respec.org/docs/
        var respecConfig = {
          specStatus: "unofficial",
          editors: [{ name: "Dataspecer", url: "https://dataspecer.com" }]
          //github: "some-org/mySpec",
          //shortName: "dahut",
          //xref: "web-platform",
          //group: "my-working-group",
        };
      </script>
          <style>
      .figure img, .sidefigure img, figure img, .figure object, .sidefigure object, figure object, img, .img {
      max-width: 100%;
      margin: auto;
      height: auto;
      }
    </style>
    </head>
    <body>
      <section id="abstract">
        <p>
          {{#iflng "cs"}}Tento soubor dokumentuje{{lng}}This file documents{{/iflng}}
          {{#translate package.userMetadata.label}}<strong>{{translation}}</strong>{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}.</p>
      </section>
      
      <section id="sotd">
      </section>

      <section>
        <h1>{{#iflng "cs"}}Přílohy{{lng}}Attachments{{/iflng}}</h1>
        <table class="def">
          {{#if externalArtifacts.owl-vocabulary}}
            <tr>
              <td>{{#iflng "cs"}}Slovník{{lng}}Vocabulary{{/iflng}}</td>
              <td><a href="{{{externalArtifacts.owl-vocabulary.[0].URL}}}">{{externalArtifacts.owl-vocabulary.[0].URL}}</a></td>
            </tr>
          {{/if}}
          {{#if externalArtifacts.dsv-profile}}
            <tr>
              <td>{{#iflng "cs"}}Aplikační profil{{lng}}Application profile{{/iflng}}</td>
              <td><a href="{{{externalArtifacts.dsv-profile.[0].URL}}}">{{externalArtifacts.dsv-profile.[0].URL}}</a></td>
            </tr>
          {{/if}}
        </table>
      </section>

      <section>
        <h1>{{#iflng "cs"}}Slovník{{lng}}Vocabulary Overview{{/iflng}}</h1>

        {{#each externalArtifacts.svg}}
          <figure>
            <img src="{{{URL}}}" alt="alt text 2" />
            <figcaption>Overview diagram</figcaption>
          </figure>
        {{/each}}

        <h2>{{#iflng "cs"}}Třídy{{lng}}Classes{{/iflng}}</h2>
        {{#iflng "cs"}}Tato sekce popisuje všechny třídy v tomto slovníku.
        {{lng}}This section lists the classes matching the base namespace of this vocabulary.
        {{/iflng}}
        

        {{#each locallyDefinedSemanticEntity}}
          {{#ifEquals type.[0] "class"}}
              <section id="{{anchor}}">
              <h4>{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}</h4>

              <table class="def">
                <tr>
                  <td>IRI</td>
                  <td><a href="{{{iri}}}">{{iri}}</a></td>
                </tr>
                {{#translate description}}
                <tr>
                  <td>{{#iflng "cs"}}Definice{{lng}}Definition{{/iflng}}</td>
                  <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
                </tr>
                {{/translate}}
                {{#if (parentClasses id)}}
                <tr>
                  <td>{{#iflng "cs"}}Rodičovské třídy{{lng}}Subclass of{{/iflng}}</td>
                  <td>{{#each (parentClasses id)}}{{class}}{{#unless @last}}, {{/unless}}{{/each}}</td>
                </tr>
                {{/if}}
                {{#if (subClasses id)}}
                <tr>
                  <td>{{#iflng "cs"}}Podtřídy z tohoto slovníku{{lng}}Subclasses{{/iflng}}</td>
                  <td>{{#each (subClasses id)}}{{class}}{{#unless @last}}, {{/unless}}{{/each}}</td>
                </tr>
                {{/if}}
              </table>
            </section>
          {{/ifEquals}}    
        {{/each}}

        {{#each locallyDefinedSemanticEntity}}
          {{#ifEquals type.[0] "class-usage"}}
            <section id="{{anchor}}">
              <h4>{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}</h4>

              <table class="def">
                <tr>
                  <td>IRI</td>
                  <td><a href="{{{iri}}}">{{iri}}</a></td>
                </tr>
                {{#semanticEntity usageOf}}
                <tr>
                  <td>{{#iflng "cs"}}Profiluje{{lng}}Profiles{{/iflng}}</td>
                  <td>{{class}} (<a href="{{{iri}}}">{{iri}}</a>)</td>
                </tr>
                {{#translate description}}
                <tr>
                  <td>{{#iflng "cs"}}Definice ze slovníku{{lng}}Definition from vocabulary{{/iflng}}</td>
                  <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
                </tr>
                {{/translate}}
                {{/semanticEntity}}
                {{#translate description}}
                <tr>
                  <td>{{#iflng "cs"}}Definice{{lng}}Definition{{/iflng}}</td>
                  <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
                </tr>
                {{/translate}}
                {{#translate usageNote}}
                <tr>
                  <td>{{#iflng "cs"}}Popis použití v profilu{{lng}}Usage note{{/iflng}}</td>
                  <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
                </tr>
                {{/translate}}
              </table>
            </section>
          {{/ifEquals}}
        {{/each}}

        <h2>{{#iflng "cs"}}Vlastnosti{{lng}}Properties{{/iflng}}</h2>
        {{#each locallyDefinedSemanticEntity}}
          {{#ifEquals type.[0] "relationship"}}
            <section id="{{anchor}}">

              <h4>{{#translate ends.1.name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}</h4>

              <table class="def">
                <tr>
                  <td>IRI</td>
                  <td><a href="{{{ends.1.iri}}}">{{ends.1.iri}}</a></td>
                </tr>
                {{#translate ends.1.description}}
                <tr>
                  <td>{{#iflng "cs"}}Definice{{lng}}Definition{{/iflng}}</td>
                  <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
                </tr>
                {{/translate}}
                <tr>
                  <td>{{#iflng "cs"}}Definiční obor{{lng}}Domain{{/iflng}}</td>
                  <td><a href="{{{href ends.0.concept}}}">{{#semanticEntity ends.0.concept}}{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}{{/semanticEntity}}</a></td>
                </tr>
                <tr>
                  <td>{{#iflng "cs"}}Obor hodnot{{lng}}Range{{/iflng}}</td>
                  <td><a href="{{{href ends.1.concept}}}">{{#semanticEntity ends.1.concept}}{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}{{/semanticEntity}}</a></td>
                </tr>
              </table>
            </section>
          {{/ifEquals}}
        {{/each}}

        {{#each locallyDefinedSemanticEntity}}
        {{#ifEquals type.[0] "relationship-usage"}}
          <section id="{{anchor}}">
            <h4>{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>{{#iflng "cs"}}beze jména{{lng}}without assigned name{{/iflng}}</i>{{/translate}}</h4>

            <table class="def">
              <tr>
                <td>IRI</td>
                <td><a href="{{{iri}}}">{{iri}}</a></td>
              </tr>
              {{#semanticEntity usageOf}}
              <tr>
                <td>{{#iflng "cs"}}Profil{{lng}}Profile of{{/iflng}}</td>
                <td>{{class}} (<a href="{{{iri}}}">{{iri}}</a>)</td>
              </tr>
              {{#translate description}}
              <tr>
                <td>{{#iflng "cs"}}Definice ze slovníku{{lng}}Definition from vocabulary{{/iflng}}</td>
                <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
              </tr>
              {{/translate}}
              {{/semanticEntity}}
              {{#translate description}}
              <tr>
                <td>{{#iflng "cs"}}Definice{{lng}}Definition{{/iflng}}</td>
                <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
              </tr>
              {{/translate}}
              {{#translate usageNote}}
              <tr>
                <td>{{#iflng "cs"}}Popis použití v profilu{{lng}}Usage note{{/iflng}}</td>
                <td>{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}</td>
              </tr>
              {{/translate}}
            </table>
          </section>
        {{/ifEquals}}
      {{/each}}
      </section>

    </body>
  </html>`,
  language: "en"
};

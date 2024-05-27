import { DocumentationGeneratorConfiguration } from "./generator";

export const defaultConfiguration: DocumentationGeneratorConfiguration = {
  template: `<!DOCTYPE html>
  {{#def "class"}}<a href="{{href id}}">{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}</a>{{/def}}
  <html>
    <head>
      <meta charset="utf-8" />
      <title>{{translate package.userMetadata.label}}</title>
      <script
        src="https://www.w3.org/Tools/respec/respec-w3c"
        class="remove"
        defer
      ></script>
      <script class="remove">
        // All config options at https://respec.org/docs/
        var respecConfig = {
          specStatus: "ED",
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
        <p>This file documents package {{#translate package.userMetadata.label}}<strong>{{translation}}</strong>{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}.</p>
      </section>
      <section id="sotd">
        <p>This is required.</p>
      </section>

      {{#each semanticModels}}
        <section>
          <h1>Vocabulary Overview</h1>
          <h2>Classes</h2>
          This section lists the classes matching the base namespace of this vocabulary.

          {{#each this}}
        
            {{#ifEquals type.[0] "class"}}
                <section id="{{anchor}}">
                <h4>{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}</h4>

                <table class="def">
                  <tr>
                    <td>Internal ID</td>
                    <td><a href="{{href id}}">{{id}}</a></td>
                  </tr>
                  <tr>
                    <td>Public IRI</td>
                    <td><a href="{{iri}}">{{iri}}</a></td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>{{translate description}}</td>
                  </tr>
                  <tr>
                    <td>Parent classes</td>
                    <td>{{#each (parentClasses id)}}{{class}}{{#unless @last}}, {{/unless}}{{/each}}</td>
                  </tr>
                  <tr>
                    <td>Sub-classes</td>
                    <td>{{#each (subClasses id)}}{{class}}{{#unless @last}}, {{/unless}}{{/each}}</td>
                  </tr>
                </table>
              </section>
            {{/ifEquals}}    
          {{/each}}
  

          <h2>Profiles of classes</h2>
          This section lists the profiles of classes.


          {{#each this}}
            {{#ifEquals type.[0] "class-usage"}}
              <section id="{{anchor}}">
                <h4>{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}</h4>

                <table class="def">
                  <tr>
                    <td>Internal ID</td>
                    <td><a href="{{href id}}">{{id}}</a></td>
                  </tr>
                  <tr>
                    <td>Public IRI</td>
                    <td><a href="{{iri}}">{{iri}}</a></td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>{{translate description}}</td>
                  </tr>
                  <tr>
                    <td>Usage Note</td>
                    <td>{{translate usageNote}}</td>
                  </tr>
                </table>
              </section>
            {{/ifEquals}}
          {{/each}}

          <h2>Properties</h2>
          {{#each this}}
            {{#ifEquals type.[0] "relationship"}}
              <section id="{{anchor}}">

                <h4>{{#translate ends.1.name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}</h4>

                <table class="def">
                  <tr>
                    <td>Internal ID</td>
                    <td><a href="{{href id}}">{{id}}</a></td>
                  </tr>
                  <tr>
                    <td>Public IRI</td>
                    <td><a href="{{ends.1.iri}}">{{ends.1.iri}}</a></td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>{{translate ends.1.description}}</td>
                  </tr>
                  <tr>
                    <td>Domain</td>
                    <td><a href="{{href ends.0.concept}}">{{#semanticEntity ends.0.concept}}{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}{{/semanticEntity}}</a></td>
                  </tr>
                  <tr>
                    <td>Range</td>
                    <td><a href="{{href ends.1.concept}}">{{#semanticEntity ends.1.concept}}{{#translate name}}{{translation}}{{#if otherLang}} (@{{otherLang}}){{/if}}{{else}}<i>without assigned name</i>{{/translate}}{{/semanticEntity}}</a></td>
                  </tr>
                </table>
              </section>
            {{/ifEquals}}
          {{/each}}


        </section>
      {{/each}}

    </body>
  </html>`,
};
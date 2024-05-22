import { DocumentationGeneratorConfiguration } from "./generator";

export const defaultConfiguration: DocumentationGeneratorConfiguration = {
  template: `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>{{package.userMetadata.label.cs}} ({{package.iri}})</title>
      <script
        src="https://www.w3.org/Tools/respec/respec-w3c"
        class="remove"
        defer
      ></script>
      <script class="remove">
        // All config options at https://respec.org/docs/
        var respecConfig = {
          specStatus: "ED",
          editors: [{ name: "Dataspecer", url: "https://dataspecer.com" }],
          //github: "some-org/mySpec",
          //shortName: "dahut",
          //xref: "web-platform",
          //group: "my-working-group",
        };
      </script>
    </head>
    <body>
      <section id="abstract">
        <p>This file documents package <strong>{{package.userMetadata.label.cs}}</strong>.</p>
      </section>
      <section id="sotd">
        <p>This is required.</p>
      </section>


      <section>
        <h2>Semantic models</h2>
        <p>This section describes all semantic models that are contained within the package.</p>

        {{#each semanticModels}}
          <section>
            <h3>Semantic model</h3>
            <h4>Classes</h4>
            <ul>
              {{#each this}}
                {{#ifEquals type.[0] "class"}}
                  <li>{{iri}}: {{name.cs}} {{name.en}}</li>
                {{/ifEquals}}
              {{/each}}
            </ul>
          </section>
        {{/each}}
      </section>

    </body>
  </html>`,
};
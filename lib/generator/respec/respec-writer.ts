import * as fileSystem from "fs";
import * as path from "path";

import {
  ReSpec,
  ReSpecEntity,
  ReSpecProperty,
  ReSpecTypeReference,
} from "./respec-model";
import {WriteStream} from "fs";

export function writeReSpecToDirectory(model: ReSpec, directory: string) {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }
  const outputStream = fileSystem.createWriteStream(
    path.join(directory, "index.html"));
  outputStream.write("<!DOCTYPE html>\n")
  outputStream.write("<html lang=\"cs\">")
  writeHeader(model, outputStream);
  writeBody(model, outputStream);
  outputStream.write("\n</html>\n")
  outputStream.close();
}

function writeHeader(model: ReSpec, stream: WriteStream) {
  const title = model.metadata.title;
  stream.write(`
  <head>
    <title>${title}</title>
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
        var respecConfig = {
            specStatus: "REC",
            publishDate: "${currentDate()}",
            shortName: "${title}",
            showPreviousVersion: false,
            thisVersion: "${model.url}",
            latestVersion: "${model.url}",
            editors: [{
              name: "Model Drive Data",
              company: "Model Drive Data",
              companyURL: "https://github.com/opendata-mvcr/model-driven-data"
            }],
            inlineCSS: "true",
            otherLinks: [{
                key: "Odkazy",
                data: [{
                    value: "Portál otevřených dat",
                    href: "https://data.gov.cz"
                },{
                    value: "Kontaktní e-mail",
                    href: "mailto:otevrenadata@mvcr.cz"
                }]
            }],
            thanks: "Tento dokument vznikl v rámci projektu OPZ č. CZ.03.4.74/0.0/0.0/15_025/0013983."
          };
    </script>
  </head>`);
}

function currentDate() {
  const date = new Date();
  let month = "" + (date.getMonth() + 1);
  let day = "" + date.getDate();
  const year = date.getFullYear();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return [year, month, day].join("-");
}

function writeBody(model: ReSpec, stream: WriteStream) {
  stream.write("\n  </body>")
  writeIntroduction(model, stream);
  writeOverview(model, stream);
  writeSpecification(model, stream);
  writeExamples(model, stream);
  stream.write("\n  </body>")
}

function writeIntroduction(model: ReSpec, stream: WriteStream) {
  stream.write(`
    <section id="abstract" class="introductory">
      <h2>Abstrakt</h2>
      <p>
          Tento dokument je sdílenou specifikací, která je součástí 
          otevřených formálních norem ve smyslu 
          <a href="https://www.zakonyprolidi.cz/cs/1999-106#p3-9">
            § 3 odst. 9 zákona č. 106/1999 Sb., o svobodném přístupu 
            k informacím
          </a>.
          Věc v této specifikaci reprezentuje předka 
          (ve smyslu dědičnosti) všech tříd definovaných v jiných
          specifikacích a otevřených formálních normách. Její vlastnosti
          a vazby tedy lze použít vždy a jsou specifikovány zde,
          na jednom místě.
      </p>
    </section>`);
}

function writeOverview(model: ReSpec, stream: WriteStream) {
  stream.write(`
    <section id="přehled">
      <h2>Přehled</h2>
    </section>
`);
}

function writeSpecification(model: ReSpec, stream: WriteStream) {
  stream.write(`
    <section id="specifikace">
      <h2>Specifikace</h2>
      <p></p>
`);
  model.specification.entities.forEach(entity => writeFosEntity(entity, stream));
  stream.write("\n    </section>");
}

function writeFosEntity(entity: ReSpecEntity, stream: WriteStream) {
  stream.write(`
      <section id="třída-${entity.relativeLink}">
        <h3>${entity.humanLabel}</h3>
        <p>${entity.humanDescription}.</p>`);
  entity.properties.forEach(property =>
    writeFosProperty(entity, property, stream));
  stream.write("\n      </section>");
}

function writeFosProperty(
  owner: ReSpecEntity, property: ReSpecProperty, stream: WriteStream
) {
  const types = property.type
    .map(type => `<a href="${createTypeLink(type)}">${type.label}</a>`)
    .join("");
  const examples = property.examples
    .map(iri => `<code>${iri}</code>`)
    .join("");
  stream.write(`
        <section id="vlastnost-${owner.relativeLink}-${property.relativeLink}">
          <h4>${property.humanLabel}</h4>
          <dl>
              <dt>Vlastnost</dt>
              <dd><code>${property.technicalLabel}</code></dd>
              <dt>Typ</dt>
              <dd>${types}</dd>
              <dt>Jméno</dt>
              <dd>${property.humanLabel}</dd>
              <dt>Popis</dt>
              <dd>${property.humanDescription}</dd>
              <dt>Příklad</dt>
              <dd>${examples}</dd>
          </dl>
        </section>`);
}

function createTypeLink(reference: ReSpecTypeReference) {
  return reference.schemaLink + "#třída-" + reference.relativeLink;
}

function writeExamples(model: ReSpec, stream: WriteStream) {
  stream.write(`
    <section id="příklady">
      <h2>Příklady</h2>
      <p>
          V této sekci jsou uvedeny příklady reprezantace věcí v různých 
          úrovních detailu, ve formátu JSON-LD [[!json-ld11]], a tedy i JSON 
          [[!ECMA-404]].
      </p>
    </section>
`);
}

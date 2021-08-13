import * as fileSystem from "fs";
import * as path from "path";

import {ReSpec} from "./respec-model";
import {
  WebSpecificationEntity,
  WebSpecificationProperty,
  WebSpecificationSchema,
  WebSpecificationType,
} from "../web-specification/web-specification-model";
import {OutputStream} from "../io/stream/outputStream";

export async function saveReSpec(
  model: ReSpec, directory: string, name: string,
): Promise<void> {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }

  const outputStream = fileSystem.createWriteStream(
    path.join(directory, name + ".html"));

  const result = new Promise<void>( (accept, reject) => {
    outputStream.on("close", accept);
    outputStream.on("error", reject);
  });

  // wrap outputStream into a Writable object
  const writable = {
    write: chunk =>
      new Promise<void>((resolve, reject) => {
        outputStream.write(chunk, error => error ? reject(error) : resolve());
      }),
  } as OutputStream;

  await writeReSpec(model, writable);
  outputStream.close();

  return result;
}

export async function writeReSpec(model: ReSpec, writable: OutputStream): Promise<void> {
  await writable.write("<!DOCTYPE html>\n");
  await writable.write("<html lang=\"cs\">");
  await writeHeader(model, writable);
  await writeBody(model, writable);
  await writable.write("\n</html>\n");
}

async function writeHeader(model: ReSpec, writable: OutputStream): Promise<void> {
  const title = model.metadata.title;
  await writable.write(`
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
            thisVersion: "",
            latestVersion: "",
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

async function writeBody(model: ReSpec, writable: OutputStream): Promise<void> {
  await writable.write("\n  </body>");
  await writeIntroduction(model, writable);
  await writeSpecification(model.schemas, writable);
  await writeExamples(model, writable);
  await writable.write("\n  </body>");
}

async function writeIntroduction(model: ReSpec, writable: OutputStream): Promise<void> {
  await writable.write(`
    <section id="abstract" class="introductory">
      <h2>Abstrakt</h2>
      <p>
        Tento dokument je sdílenou specifikací.
      </p>
    </section>`);
}

async function writeSpecification(
  specification: WebSpecificationSchema, writable: OutputStream,
): Promise<void> {
  await writable.write(`
    <section id="specifikace">
      <h2>Specifikace</h2>
      <p>
        V této sekci jsou definovány jednotlivé třídy a jejich vlastnosti. 
        Pro každou vlastnost je uveden její identifikátor, který je pro její
        reprezentaci použit ve všech datových formátech, její název a datový typ.
        Volitelně je uveden také popis a příklad. 
      </p>
`);
  for (const entity of specification.entities) {
    await writeEntity(entity, writable);
  }
  await writable.write("\n    </section>");
}

async function writeEntity(entity: WebSpecificationEntity, writable: OutputStream): Promise<void> {
  await writable.write(`
      <section id="${entity.anchor}">
        <h3>${entity.humanLabel}</h3>
        <p>`);
  if (entity.isCodelist) {
    await writable.write("Tato třída reprezentuje číselník.<br/>");
  }
  await writable.write(`${entity.humanDescription}</p>`);
  for (const property of entity.properties) {
    await writeFosProperty(entity, property, writable);
  }
  await writable.write("\n      </section>");
}

async function writeFosProperty(
  owner: WebSpecificationEntity,
  property: WebSpecificationProperty,
  writable: OutputStream,
): Promise<void> {
  await writable.write(`
        <section id="${property.anchor}">
          <h4>${property.humanLabel}</h4>
          <dl>
              <dt>Vlastnost</dt>
              <dd><code>${property.technicalLabel}</code></dd>`);
  await writePropertyTypes(property, writable);
  await writePropertyHumanLabel(property, writable);
  await writePropertyHumanDescription(property, writable);
  await writable.write(`
          </dl>
         </section>`);
}

async function writePropertyTypes(
  property: WebSpecificationProperty, writable: OutputStream): Promise<void> {
  const types = property.type
    .map(writePropertyType)
    .join("");
  await writable.write(`
              <dt>Typ</dt>
              <dd>${types}</dd>`);
}

function writePropertyType(type: WebSpecificationType): string {
  const linkElement = type.link === undefined ?
    "" : ` <a href="${type.link}">${type.label}</a>`;

  if (type.codelistIri !== undefined) {
    return "Číselník" + linkElement;
  }
  if (type.isClassValue) {
    return "Identifikátor pro " + linkElement;
  }
  return linkElement;
}

async function writePropertyHumanLabel(
  property: WebSpecificationProperty, writable: OutputStream): Promise<void> {
  await writable.write(`
            <dt>Jméno</dt>
            <dd>${property.humanLabel}</dd>`);
}

async function writePropertyHumanDescription(
  property: WebSpecificationProperty, writable: OutputStream): Promise<void> {
  if (isStringEmpty(property.humanDescription)) {
    return;
  }
  await writable.write(`
              <dt>Popis</dt>
              <dd>${property.humanDescription}</dd>`);
}

function isStringEmpty(content: string): boolean {
  return content === undefined || content.trim().length === 0;
}

async function writeExamples(model: ReSpec, writable: OutputStream): Promise<void> {
  await writable.write(`
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

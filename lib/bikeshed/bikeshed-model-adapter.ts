import {Bikeshed, BikeshedMetadataKeys} from "./bikeshed-model";
import {WebSpecification} from "../web-specification";

export function webSpecificationToBikeshed(
  webSpecification: WebSpecification
): Bikeshed {
  const result = new Bikeshed();
  result.humanLabel = webSpecification.humanLabel;
  result.humanDescription = webSpecification.humanDescription;
  result.conceptual = webSpecification.conceptual;
  result.structures = webSpecification.structures;
  result.metadata = loadBikeshedMetadata(webSpecification);
  return result;
}

function loadBikeshedMetadata(
  webSpecification: WebSpecification
): Record<string, string> {
  return {
    [BikeshedMetadataKeys.title]: webSpecification.humanLabel ?? "-",
    [BikeshedMetadataKeys.shortname]: webSpecification.humanLabel ?? "-",
    [BikeshedMetadataKeys.status]: "LS",
    [BikeshedMetadataKeys.editor]: "Model-Driven Generator",
    [BikeshedMetadataKeys.boilerplate]: "conformance no, copyright no",
    [BikeshedMetadataKeys.abstract]:
    `Tento dokument je otevřenou formální normou ve smyslu <a href="https://www.zakonyprolidi.cz/cs/1999-106#p3-9">§ 3 odst. 9 zákona č. 106/1999 Sb., o svobodném přístupu k informacím</a>, pro zveřejňování číselníků.`
    + `Norma popisuje konceptuální model číselníků a stanovuje podobu jejich reprezentace ve strojově čítelné podobě ve formátech JSON-LD [[json-ld11]], a tedy i JSON [[ECMA-404]], a CSV [[rfc4180]] v denormalizované i normalizované podobě.`
    + `Jednotlivé způsoby reprezentace číselníků také demonstruje na příkladech.`,
    [BikeshedMetadataKeys.markup]: "markdown yes",
  };
}

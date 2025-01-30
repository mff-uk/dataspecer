import { IRI } from "iri";

export function isRelativeIri(iri: string | undefined | null): boolean {
  if (iri === undefined || iri === null) {
    return true;
  }
  return (new IRI(iri).scheme()?.length ?? 0) === 0;
}

export function absoluteIriToRelative(iri: string) : {
  base: string,
  relative: string,
} {
  const index = Math.max(
    iri.lastIndexOf("/"),
    iri.lastIndexOf("#")
  );

  if (index === -1) {
    return {
      base: iri,
      relative: "",
    };
  }

  return {
    base: iri.substring(0, index + 1),
    relative: iri.substring(index + 1),
  };
}

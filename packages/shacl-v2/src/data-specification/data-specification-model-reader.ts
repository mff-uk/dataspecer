import { BrokenDataSpecification, DataspecerDataSpecification, DataSpecification, DataSpecificationReference, DataSpecificationResource, DataSpecificationResourceFormat, DataSpecificationResourceRole, DataSpecificationType, RdfDataSpecification } from "./data-specification-model.ts";

const START_TOKEN = `<script type="application/ld+json">`;

const END_TOKEN = `</script>`;

/**
 * Read specification at given URL and recursively all re-used
 * specifications.
 */
export async function readDataSpecifications(
  url: string,
): Promise<Record<string, DataSpecification>> {
  const queue: string[] = [url];
  const cache: Record<string, DataSpecification> = {};
  const visited: string[] = [];
  while (queue.length > 0) {
    const next = queue.pop()!;
    if (visited.includes(next)) {
      continue;
    }
    const dataSpecification = await fetchDataSpecification(next);
    cache[next] = dataSpecification;
    visited.push(next);
    // Add all profiled specializations.
    dataSpecification.profileOf.forEach(item => queue.push(item.url));
  }
  return cache;
}

async function fetchDataSpecification(
  url: string,
): Promise<DataSpecification> {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("text/html")) {
    const text = await response.text();
    return loadHtmlSpecification(url, text);
  } else if (contentType.startsWith("text/turtle")) {
    return loadVocabularySpecification(
      url, DataSpecificationResourceFormat.Turtle);
  } else if (contentType.startsWith("application/rdf+xml")) {
    return loadVocabularySpecification(
      url, DataSpecificationResourceFormat.RDFXML);
  } else if (contentType.startsWith("application/ld+json")) {
    return loadVocabularySpecification(
      url, DataSpecificationResourceFormat.JSONLD);
  } else {
    return loadBrokenSpecification(url);
  }
}

function loadHtmlSpecification(url: string, html: string): DataSpecification {
  const start = html.indexOf(START_TOKEN) + START_TOKEN.length;
  const end = html.indexOf(END_TOKEN, start);
  const metadata = JSON.parse(html.substring(start, end));
  //
  const specification = metadata["inSpecificationOf"][0];
  return {
    type: DataSpecificationType.Dataspecer,
    url: metadata["@id"],
    title: specification["title"] ?? {},
    description: specification["description"] ?? {},
    profileOf: specification["isProfileOf"]
      .map(parseProfileOf),
    resources: specification["hasResource"]
      .map((item: any) => parseResource(url, item)),
  } as DataspecerDataSpecification;
}

function parseProfileOf(metadata: any): DataSpecificationReference {
  const url = metadata["hasArtifact"][0]!;
  return {
    url,
  };
}

function parseResource(baseUrl: string, metadata: any): DataSpecificationResource {
  return {
    url: resolveUrl(baseUrl, metadata["hasArtifact"]),
    format: parseResourceFormat(metadata["format"]),
    role: parseResourceRole(metadata["hasRole"]),
  };
}

function resolveUrl(baseUrl: string, relativeUrl: string): string {
  return new URL(relativeUrl, baseUrl).toString();
}

function parseResourceRole(value: string): DataSpecificationResourceRole {
  switch (value) {
    case "role:Specification":
      return DataSpecificationResourceRole.Profile;
    case "role:Vocabulary":
      return DataSpecificationResourceRole.Vocabulary;
    case "role:Guidance":
      return DataSpecificationResourceRole.Guidance;
    default:
      return DataSpecificationResourceRole.Unknown;
  }
}

function parseResourceFormat(value: string): DataSpecificationResourceFormat {
  switch (value) {
    case "filetype:RDF_TURTLE":
      return DataSpecificationResourceFormat.Turtle;
    case "filetype:SVG":
      return DataSpecificationResourceFormat.SVG;
    case "filetype:HTML":
      return DataSpecificationResourceFormat.HTML;
    default:
      return DataSpecificationResourceFormat.Unknown;
  }
}

function loadVocabularySpecification(
  url: string,
  format: DataSpecificationResourceFormat,
): DataSpecification {
  return {
    type: DataSpecificationType.Vocabulary,
    url,
    profileOf: [],
    resources: [{
      url,
      format,
      role: DataSpecificationResourceRole.Vocabulary,
    }],
  } as RdfDataSpecification;
}

function loadBrokenSpecification(url: string): DataSpecification {
  return {
    type: DataSpecificationType.Broken,
    url,
    profileOf: [],
    resources: [],
  } as BrokenDataSpecification;
}

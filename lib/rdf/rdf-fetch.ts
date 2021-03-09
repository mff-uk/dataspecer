//
// Custom fetch implementation to work with files and URLs.
//

import {createReadStream} from "fs";
import makeFetchHappen from "make-fetch-happen";
import {Response} from "minipass-fetch";

const fetch = makeFetchHappen.defaults({
  "cacheManager": "./.http-cache",
  "cache": "no-store",
});

// https://github.com/hyperjump-io/json-schema-core/blob/517247ab8848b44e0b0129bc802790c8ab6cb956/lib/schema.js#L159
export default function fetchUrl(
  url: string, options: Record<string, unknown>,
): Response {
  if (url.startsWith("file://")) {
    const path = url.match(/file:\/\/(.+)/)[1];
    const stream = createReadStream(path);
    const headers = {
      "content-type": getFileContentType(path.substr(path.lastIndexOf("."))),
    };
    return new Response(stream, {"headers": headers});
  } else {
    return fetch(url, options);
  }
}

function getFileContentType(extension: string): string {
  extension = extension.substr(1).toLowerCase();
  switch (extension) {
    case "jsonld":
      return "application/ld+json";
    case "trig":
      return "application/trig";
    case "ttl":
      return "text/turtle";
    case "n3":
      return "application/n-triples";
    case "nq":
      return "application/n-quads";
    default:
      return undefined;
  }
}

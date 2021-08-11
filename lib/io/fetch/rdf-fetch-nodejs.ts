import {createReadStream} from "fs";
import minipassFetch from "minipass-fetch";
import {HttpFetch, FetchResponse, FetchOptions} from "./fetch-api";

export const httpFetch: HttpFetch = function fetch(
  url: string, options: FetchOptions,
): Promise<FetchResponse> {
  if (url.startsWith("file://")) {
    const path = url.match(/file:\/\/(.+)/)[1];
    const stream = createReadStream(path);
    const headers = {
      "content-type": getFileContentType(path.substr(path.lastIndexOf("."))),
    };
    // @ts-ignore
    return new minipassFetch.Response(stream, {"headers": headers});
  } else {
    return minipassFetch(url, options);
  }
};

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

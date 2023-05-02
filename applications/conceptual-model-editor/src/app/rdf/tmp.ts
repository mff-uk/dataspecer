import { RdfHttpSource } from "@dataspecer/core/io/rdf/http/http-rdf-source";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { RdfQuad } from "@dataspecer/core/io/rdf/rdf-api";

export class RdfHttpSourceExt extends RdfHttpSource {
    fetch(httpFetch: HttpFetch, url: string, asMimeType?: string | undefined): Promise<void> {
        return super.fetch(httpFetch, "https://mff-uk.github.io/demo-vocabularies/original/adms.ttl", "text/turtle");
    }

    getQuads(): RdfQuad[] {
        return this.quads;
    }
}

export const rdfres = new RdfHttpSourceExt();

import IdProvider from "../../../IdProvider";
import * as URI from 'uri-js';

export default class implements IdProvider {
    pimFromCim(pimId: string): string {
        const parsed = URI.parse(pimId, {unicodeSupport: true});

        parsed.path = `/pim/${parsed.host}${parsed.path}`;
        parsed.host = "localhost";

        return URI.serialize(parsed, {iri: true});
    }
}
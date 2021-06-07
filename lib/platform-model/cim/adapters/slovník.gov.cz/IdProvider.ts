import IdProvider from "../../../IdProvider";
import * as URI from 'uri-js';

export default class implements IdProvider {
    pimFromCim(cimId: string): string {
        const parsed = URI.parse(cimId, {unicodeSupport: true});

        parsed.path = `/pim/${parsed.host}${parsed.path}`;
        parsed.host = "localhost";

        return URI.serialize(parsed, {iri: true});
    }

    psmFromPim(pimId: string): string {
        const parsed = URI.parse(pimId, {unicodeSupport: true});

        if (!parsed.path.startsWith("/pim/")) throw `Don't know how to generate PSM id from PIM '${pimId}'.`;

        parsed.path = `/psm/${parsed.path.substr(5)}`;

        return URI.serialize(parsed, {iri: true});
    }
}
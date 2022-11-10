import { CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";
import {ExtendableCoreResource} from "./extendable-core-resource";

/**
 * Represents a root of a schema that is external, hence it has no underlying
 * parts directly in the PSM. Belongs to a schema.
 */
export class DataPsmExternalRoot extends ExtendableCoreResource {
    private static readonly TYPE = PSM.EXTERNAL_ROOT;

    /**
     * Label used by file formats, may represent a name of a property
     * in JSON or tag name in XML.
     */
    dataPsmTechnicalLabel: string | null = null;

    /**
     * PIM class representing the type.
     */
    dataPsmTypes: string[] = [];

    constructor(iri: string | null = null) {
        super(iri);
        this.types.push(DataPsmExternalRoot.TYPE);
    }

    static is(resource: CoreResource | null): resource is DataPsmExternalRoot {
        return resource?.types.includes(DataPsmExternalRoot.TYPE);
    }
}

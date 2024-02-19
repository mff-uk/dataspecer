import { StructureModel} from "@dataspecer/core/structure-model/model";
import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { ShaclAdapter } from "../../shacl-adapter";
import { ShexAdapter } from "../../shex-adapter";
import { ShexMapAdapter } from "../../shex-map-adapter";

class ShapeCreator{
    
    async createShape(sm : StructureModel) : Promise<String> {
        var artefact = new DataSpecificationArtefact();
        artefact.configuration = {publicBaseUrl: 'https://example.org/'};
        const adapter = new ShaclAdapter(sm, null, artefact);
        const data =  (await adapter.generate()).data;

        return data;
    }

    async createShexShape(sm : StructureModel) : Promise<String> {
        var artefact = new DataSpecificationArtefact();
        artefact.configuration = { "publicBaseUrl" : ""};
        const adapter = new ShexAdapter(sm, null, artefact);
        const data =  (await adapter.generate()).data;

        return data;
    }

    async createShexMap(sm : StructureModel) : Promise<String> {
        var artefact = new DataSpecificationArtefact();
        artefact.configuration = { "publicBaseUrl" : ""};
        const adapter = new ShexMapAdapter(sm, null, artefact);
        const data =  (await adapter.generate()).data;

        return data;
    }
}

export default ShapeCreator;
import { StructureModel} from "@dataspecer/core/structure-model/model";
import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
import { ShaclAdapter } from "../../shacl-adapter";

class ShapeCreator{
    
    async createShape(sm : StructureModel) : Promise<String> {
        const adapter = new ShaclAdapter(sm, null, new DataSpecificationArtefact());
        const data =  (await adapter.generate()).data;
        //await console.log(data);

        return data;
    }
}

export default ShapeCreator;
import {
    StructureModel,
    StructureModelClass,
    StructureModelType,
    StructureModelComplexType,
    StructureModelProperty,
    StructureModelPrimitiveType,
    StructureModelCustomType,
    StructureModelSchemaRoot,
  } from "@dataspecer/core/structure-model/model";
  import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
  import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
  import { ShaclAdapter } from "../shacl-adapter";
  import  ModelCreator  from "./modelCreator3";

class ShapeCreator{
    
    async createShape(smc : StructureModel ) : Promise<String> {
        const structureModelClass = new ModelCreator;
        const adapter = new ShaclAdapter(structureModelClass.createModel(), null, new DataSpecificationArtefact());
        const data =  (await adapter.generate()).data;
        await console.log(data);



        return (await adapter.generate()).data;
    }
}

export default ShapeCreator;
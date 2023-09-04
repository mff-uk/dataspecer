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
  import ModelCreator from "./ModelCreatorInterface";

class ClosedShapeModelCreator implements ModelCreator{

   createModel(): StructureModel{
    var model = new StructureModel();
  
      var primitiveType1 : StructureModelPrimitiveType;
      primitiveType1 = new StructureModelPrimitiveType();
      primitiveType1.dataType = "http://www.w3.org/2001/XMLSchema#boolean";
      primitiveType1.example = null;
      primitiveType1.regex = null;
  
      var property1 : StructureModelProperty;
      property1 = new StructureModelProperty();
      property1.cardinalityMax = 2;
      property1.cardinalityMin = 0;
      property1.cimIri = "https://example.com/mojeCimIri";
      property1.dataTypes = [primitiveType1];
      property1.dematerialize = false;
      property1.humanDescription = {["cs"]: "Popisek 1"};
      property1.humanLabel = {["cs"]: "Label 1"};
      property1.isReverse = false;
      property1.pimIri = "https://example.com/mojePimIri";
      property1.psmIri = "https://example.com/mojePsmIri";
      property1.technicalLabel = "technicky popisek";
  
  
      var class1 : StructureModelClass;
      class1 = new StructureModelClass();
      class1.cimIri = "https://example.com/class1/mojeCimIri";
      class1.codelistUrl = ["https://example.com/class1/codelistIri"];
      class1.example = null;
      //class1.extends = null;
      class1.humanDescription = {["cs"]: "Class 1 Popisek 1"};
      class1.humanLabel = {["cs"]: "Class 1 Label 1"};
      class1.pimIri = "https://example.com/class1/mojePimIri";
      class1.properties = [property1];
      class1.psmIri = "https://example.com/class1/mojePsmIri";
      class1.regex = null;
      class1.specification = null;
      class1.structureSchema = null;
      class1.technicalLabel = "Technický popisek class 1";
  
      var root1 : StructureModelSchemaRoot;
      root1 = new StructureModelSchemaRoot();
      root1.classes = [class1];
  
      model.roots = [root1];
  
    return model;
  }
}

export default ClosedShapeModelCreator;
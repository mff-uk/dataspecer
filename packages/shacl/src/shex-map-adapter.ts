import {
    StructureModel,
    StructureModelClass,
    StructureModelProperty
  } from "@dataspecer/core/structure-model/model";
  import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
  import {
    DataSpecificationArtefact,
  } from "@dataspecer/core/data-specification/model";
  import md5 from "md5";
  import {isUniqueClass, hasUniquePredicates, getUniquePredicate, anyPredicateHasUniqueType, anyPredicateHasUniquePredicates,
    getAnyPredicateUniquePredicate, getAnyPredicateUniqueType} from "./shacl-support";

  type StructureModelClassOrProperty = StructureModelClass | StructureModelProperty;

  export class ShexMapAdapter {
    
    
    protected model: StructureModel;
    protected context: ArtefactGeneratorContext;
    protected artefact: DataSpecificationArtefact;
    protected baseURL: string = "";
    protected shapeName = "";
    protected uniquePredicateClass = null;
    protected uniquePredicatePredicate  = null;
    protected root : StructureModelClass = null;
    protected rootName = null;
    protected resultString = "";
  
    constructor(
      model: StructureModel,
      context: ArtefactGeneratorContext | null,
      artefact: DataSpecificationArtefact
    ) {
      this.model = model;
      this.context = context;
      this.artefact = artefact;
  
      this.baseURL = this.artefact.configuration["publicBaseUrl"];
    }
  
    public generate = async () => {
      
      if (this.model.roots.length > 1) {
        console.warn("ShEx generator: Multiple schema roots not supported yet.");
      }
  
      const rootClasses = this.model.roots[0].classes;
      // Iterate over all classes in root OR
      for (const root of rootClasses) {
        this.shapeName = this.getIRIforShape(root);
        this.root = root;
        this.decideHowToTarget(root, root.cimIri);
      }
  
      return { data: this.resultString };
    };

    protected decideHowToTarget(cls : StructureModelClass, classNameIri : string): void {

        if(cls.instancesSpecifyTypes == "ALWAYS" && (isUniqueClass(cls))){
          // USE CASE #1
          this.resultString = "{ FOCUS rdf:type <" + cls.cimIri + ">}@<" + this.baseURL + this.shapeName + ">";
          
        } else if(hasUniquePredicates(cls)){
          // USE CASE #2
          const cimOfUniquePredicate = getUniquePredicate(cls);
          this.resultString = "{ FOCUS <" + cimOfUniquePredicate.toString() + "> _}@<" + this.baseURL + this.shapeName + ">"; 

        } else if(anyPredicateHasUniqueType(cls, this.root.cimIri)){
          // USE CASE #3
          this.uniquePredicateClass = getAnyPredicateUniqueType(cls, this.root.cimIri);  
          const shapeNameForPredicate = this.getIRIforShape(this.uniquePredicateClass);
          this.resultString = "{ FOCUS rdf:type <" + this.uniquePredicateClass.cimIri + ">}@<" + this.baseURL + shapeNameForPredicate + ">";
        } else if(anyPredicateHasUniquePredicates(cls)){
          // USE CASE #4
          this.uniquePredicatePredicate = getAnyPredicateUniquePredicate(cls); 
          const shapeNameForPredicate = this.getIRIforShape(this.uniquePredicatePredicate.uniquepropclass);
          const predicate = this.uniquePredicatePredicate.predicate as StructureModelProperty;
          this.resultString = "{ FOCUS <" + predicate.cimIri + "> _}@<" + this.baseURL + shapeNameForPredicate + ">";
        } else{
          // CANNOT TARGET THE SHAPE, fail to generate the artifact  
          throw new Error('Unable to target the Data structure defined with ShEx query map due to possible SHACL incompatibility. Either define at least one unique type of class with instance typing mandatory or define at least one unique attribute going from the root or its associations with cardinality bigger than 0.');
        }
      }
  
    protected irify(root: StructureModelClassOrProperty) : string{
      var irifiedString : string;
  
      if(root.technicalLabel != null){
        irifiedString = root.technicalLabel.replaceAll(/\s/g,"");
      } else{
        irifiedString = "";
      }
      
  
      return irifiedString;
    }
  
    protected getIRIforShape(root: StructureModelClassOrProperty): string{
      var generatedIRI : string;
      var md5String = md5(root.psmIri);
      const technicalName = this.irify(root);
      const nodeOrProperty = "Shape";
  
      generatedIRI = (this.baseURL != null) ? this.baseURL + md5String + technicalName + nodeOrProperty : md5String + technicalName + nodeOrProperty ;
  
      return generatedIRI;
    }
  
  }
import { EntityModel } from "@dataspecer/core-v2";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeGeneralization, CmeSemanticModel } from "../model";
import {
  AggregatedCmeClass,
  AggregatedCmeClassProfile,
  AggregatedCmeRelationship,
  AggregatedCmeRelationshipProfile,
} from "./cme-aggregator-model";

type UnSubscribe = () => void;

interface Change<Type> {

  identifier: EntityDsIdentifier;

  model: ModelDsIdentifier;

  previous: Type | null;

  next: Type | null;

}

export interface TypeResolver {

  isPrimitiveType: (iri: string) => boolean;

  isComplexType: (iri: string) => boolean;

}

export interface CmeAggregator {

  addModel: (model: EntityModel) => void;

  deleteModel: (model: EntityModel) => void;

  subscribeToChanges: (observer: (
    semanticModelChange: Change<CmeSemanticModel>,
    classChange: Change<AggregatedCmeClass>,
    classProfileChange: Change<AggregatedCmeClassProfile>,
    relationChange: Change<AggregatedCmeRelationship>,
    relationProfileChange: Change<AggregatedCmeRelationshipProfile>,
    generalizationChange: Change<CmeGeneralization>,
  ) => void) => UnSubscribe;

}

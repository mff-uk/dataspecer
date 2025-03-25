import {
  CmeClass,
  CmeClassProfile,
  CmeGeneralization,
  CmeReference,
  CmeRelationship,
  CmeRelationshipProfile,
} from "../model";

interface Aggregated {

  aggregate: true;

  /**
   * Hold list of references for entity that depends on this entity.
   */
  derivedEntities: CmeReference[];

}

export interface AggregatedCmeClass
  extends CmeClass, Aggregated {

}

export interface AggregatedCmeClassProfile
  extends CmeClassProfile, Aggregated {

}

export interface AggregatedCmeRelationship
  extends CmeRelationship, Aggregated {

}

export interface AggregatedCmeRelationshipProfile
  extends CmeRelationshipProfile, Aggregated {

}

export interface AggregatedCmeGeneralization
  extends CmeGeneralization, Aggregated {

}

/**
 * Idea is to have a simple model that can be directly used (JSON serialized)
 * with @context instead of using adapters that transform model to something
 * that can be used instead of directly using the serialization interface.
 */

import { LanguageString } from "@dataspecer/core/core/core-resource";
import { ADMS, PROF } from "./well-known.ts";

const ID = "@id";
const TYPE = "@type";

/**
 * Creates a representation for Semantic Data Specification - Application
 * Profile or Vocabulary.
 */
export function semanticDataSpecification(data: {
  id: string;
  types: string[];

  title: LanguageString;
  token?: string;
  profileOf: object[];

  hasResource: object[];
}): Record<string, any> {
  const result: Record<string, any> = {
    [ID]: data.id,
    [TYPE]: [...data.types, PROF.Profile],

    // http://purl.org/dc/terms/title
    title: data.title,
    //// http://purl.org/dc/terms/description
    //"description": {},
    // http://www.w3.org/ns/dx/prof/isProfileOf
    isProfileOf: data.profileOf.map((p) => usedVocabulary(p as any)),

    // http://www.w3.org/ns/dx/prof/hasResource
    hasResource: data.hasResource,
  };

  if (data.token) {
    // http://www.w3.org/ns/dx/prof/hasToken
    result.hasToken = data.token;
  }

  return result;
}

/**
 * Creates a representation for Resource Descriptor - either general or
 * Application Profile Specification Document or Vocabulary Specification
 * Document.
 */
export function resourceDescriptor(data: {
  id: string;
  types?: string[];
  artifactFullUrl: string;
  roles: string[] | string;
  format: string;
  conformsTo?: string | string[];
}): Record<string, any> {
  return {
    [ID]: data.id,
    [TYPE]: [...(data.types ?? []), ADMS.AssetDistribution, PROF.ResourceDescriptor], // todo adms may be not needed

    // http://www.w3.org/ns/dx/prof/hasArtifact
    hasArtifact: data.artifactFullUrl,
    // http://www.w3.org/ns/dx/prof/hasRole
    hasRole: data.roles,
    // http://purl.org/dc/terms/format
    format: data.format,
    // http://purl.org/dc/terms/conformsTo
    conformsTo: data.conformsTo,
  };
}

/**
 * Creates a representation for used vocabulary = external profile.
 */
export function usedVocabulary(data: {
  /**
   * The IRI of the vocabulary if known.
   */
  iri: null | string;

  /**
   * At least one URL of the vocabulary that was used for importing.
   */
  urls: string[];
  title: LanguageString;
}): object {
  const result: any = {};
  if (data.iri) {
    result[ID] = data.iri;
  }
  result.hasArtifact = data.urls;
  return result;
}

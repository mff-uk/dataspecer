import { VisualNode } from "@dataspecer/core-v2/visual-model";

// TODO: For now I will just fix it this simple way ... I still kind of find the type weird, but maybe it is better than having
//       "Record<string, VisualEntity>" everywhere
type SemanticEntityIdentifier = string;
export type VisualEntities = Record<SemanticEntityIdentifier, VisualNode>;
import { API_SPECIFICATION_MODEL, LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL, V1 } from "@dataspecer/core-v2/model/known-models";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { Code, Cog, Eye, Folder, Globe2, LibraryBig } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "./lib/utils";
import { packageService, requestLoadPackage } from "./package";

export function getCMELink(packageId: string, viewId: string) {
  return import.meta.env.VITE_CME + "/diagram?package-id=" + encodeURIComponent(packageId) + "&view-id=" + encodeURIComponent(viewId)
}

export interface createModelContext {
  iri?: string;
  parentIri: string;
  modelType?: string;
  label?: LanguageString;
  description?: LanguageString;
  baseIri?: string;
  modelAlias?: string;
}

function getHookForStandardModel(type: string, initialContent: (iri: string, context: createModelContext) => any) {
  return async (context: createModelContext) => {
    const iri = uuidv4();
    await fetch(import.meta.env.VITE_BACKEND + "/resources?parentIri=" + encodeURIComponent(context.parentIri), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        iri: iri,
        type: type,
        userMetadata: {
          label: context.label,
          description: context.description,
        }
      }),
    });
    await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(initialContent(iri, context)),
    });
    await requestLoadPackage(context.parentIri, true);
    return iri;
  }
}

export const createModelInstructions = {
  [LOCAL_PACKAGE as string]: {
    needsNaming: true,
    createHook: async (context: createModelContext) => {
      const iri = uuidv4();
      await packageService.createPackage(context.parentIri, {
        iri, 
        userMetadata: {
          label: context.label,
          description: context.description,
        }
      });
      await requestLoadPackage(context.parentIri, true);
      return iri;
    }
  },
  [API_SPECIFICATION_MODEL]: {
    needsNaming: true,
    createHook: getHookForStandardModel(API_SPECIFICATION_MODEL, () => {}),
  },
  [V1.PSM]: {
    needsNaming: false,
    createHook: getHookForStandardModel(V1.PSM, () => ({operations: [], resources: []})),
  },
  [LOCAL_VISUAL_MODEL]: {
    needsNaming: false,
    createHook: getHookForStandardModel(LOCAL_VISUAL_MODEL, iri => ({
      "type": "http://dataspecer.com/resources/local/visual-model",
      "modelId": iri,
      "visualEntities": {},
      "modelColors": {
        "vhfk9": "#ffd670"
      }
    })),
  },
  [LOCAL_SEMANTIC_MODEL]: {
    needsNaming: false,
    createHook: getHookForStandardModel(LOCAL_SEMANTIC_MODEL, (iri, context) => ({
      "type": "http://dataspecer.com/resources/local/semantic-model",
      "modelId": iri,
      "modelAlias": context.modelAlias ?? "",
      "baseIri": context.baseIri ?? iri,
      "entities": {}
    })),
  },
}

export const modelTypeToName = {
    [LOCAL_PACKAGE]: "Directory",
    [LOCAL_VISUAL_MODEL]: "Visual model",
    [LOCAL_SEMANTIC_MODEL]: "Semantic model",
    [V1.CIM]: "CIM",
    [V1.PIM]: "PIM",
    [V1.PSM]: "PSM",
    [V1.GENERATOR_CONFIGURATION]: "Generator configuration",
    "https://dataspecer.com/core/model-descriptor/sgov": "SSP",
    "https://dataspecer.com/core/model-descriptor/pim-store-wrapper": "PIM Wrapper",
    [API_SPECIFICATION_MODEL]: "OpenAPI Specification",
  };

export const ModelIcon = ({ type, className }: { type: string[], className?: string }) => {
  if (type.includes(LOCAL_PACKAGE)) {
    return <Folder className={cn("text-gray-400", className)} />;
  }
  if (type.includes(LOCAL_VISUAL_MODEL)) {
    return <Eye className={cn("text-purple-400", className)} />;
  }
  if (type.includes(LOCAL_SEMANTIC_MODEL)) {
    return <LibraryBig className={cn("text-yellow-400", className)} />;
  }
  if (type.includes(V1.CIM)) {
    return <Globe2 className={cn("text-green-400", className)} />;
  }
  if (type.includes(V1.PIM)) {
    return <LibraryBig className={cn("text-orange-400", className)} />;
  }
  if (type.includes(V1.PSM)) {
    return <Code className={cn("text-red-400", className)} />;
  }
  if (type.includes(V1.GENERATOR_CONFIGURATION)) {
    return <Cog className={cn("text-purple-400", className)} />;    
  }
  if (type.includes("https://dataspecer.com/core/model-descriptor/sgov")) {
    return <Globe2 className={cn("text-green-400", className)} />;
  }
  if (type.includes("https://dataspecer.com/core/model-descriptor/pim-store-wrapper")) {
    return <LibraryBig className={cn("text-orange-400", className)} />;
  }
  if (type.includes(API_SPECIFICATION_MODEL)) {
    return <span className={cn("aspect-square w-[24px] leading-[24px] align-middle text-center text-blue-800 font-bold text-xs", className)} >API</span>;
  }
};
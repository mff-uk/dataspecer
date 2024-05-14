import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";
import { LayoutMethod } from "./layout-iface";

import { doElkLayout } from "./elk-layouts"

// TODO: Hopefully just exports type and doesn't have any side-effects
export type { IConstraintSimple } from "./constraints";         



// export async function doLayout(inputSemanticModel: Record<string, SemanticModelEntity>,
//     config: Record<string, IConstraintSimple>): Promise<VisualEntities> { 
export async function doLayout(inputSemanticModel: Record<string, SemanticModelEntity>, config: object): Promise<VisualEntities> {    
    return doLayoutInternal(doElkLayout, inputSemanticModel, config);    
}

async function doLayoutInternal(layout: LayoutMethod, inputSemanticModel: Record<string, SemanticModelEntity>, config?: object) {
    return layout(inputSemanticModel, config);    
}
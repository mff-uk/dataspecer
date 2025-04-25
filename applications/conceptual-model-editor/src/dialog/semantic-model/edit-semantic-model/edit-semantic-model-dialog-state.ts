import { CmeSemanticModelType } from "@/dataspecer/cme-model";
import { ModelDsIdentifier } from "@/dataspecer/entity-model";
import { HexColor } from "@dataspecer/core-v2/visual-model";

export interface EditSemanticModelDialogState {

  language: string;

  identifier: ModelDsIdentifier;

  modelType: CmeSemanticModelType;

  color: HexColor;

  baseIri: string;

  baseIriDisabled: boolean;

  label: string;

  labelDisabled: boolean;

}

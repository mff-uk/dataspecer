import { LanguageString } from '@dataspecer/core/core/core-resource';

export interface TechnicalLabelOperationContext {
    getTechnicalLabelFromPim(name: LanguageString): string | null;
}

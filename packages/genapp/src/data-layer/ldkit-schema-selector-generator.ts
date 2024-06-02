import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { TemplateDescription } from "../app-logic-layer/template-app-logic-generator";

interface SchemaSelectorTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
    }
}

export class LDkitSchemaSelectorGenerator extends TemplateConsumer {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "../templates/overview/ldkit-schema-selector",
            filePath ?? "./ldkit-schemas/schema-selector.ts"
        );
    }

    consumeTemplate(): LayerArtifact {
        
        const schemaSelectorTemplate: SchemaSelectorTemplate = {
            templatePath: this._templatePath,
            placeholders: {
            }
        };

        const schemaSelectorRender: string = this._templateRenderer.renderTemplate(schemaSelectorTemplate);

        const schemaSelectorArtifact: LayerArtifact = {
            sourceText: schemaSelectorRender,
            exportedObjectName: "LDkitSchemaSelector",
            filePath: this._filePath
        }

        return schemaSelectorArtifact;
    }
}
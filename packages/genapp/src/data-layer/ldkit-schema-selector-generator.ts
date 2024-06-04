import { LayerArtifact } from "../engine/layer-artifact";
import { SchemaSelectorTemplate } from "../template-interfaces/data/schema-selector-template";
import { TemplateConsumer } from "../templates/template-consumer";

export class LDkitSchemaSelectorGenerator extends TemplateConsumer {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./list/ldkit-schema-selector",
            filePath ?? "./ldkit-schemas/schema-selector.ts"
        );
    }

    consumeTemplate(): LayerArtifact {
        
        const schemaSelectorTemplate: SchemaSelectorTemplate = {
            templatePath: this._templatePath,
            placeholders: {}
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
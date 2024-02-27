import { ApplicationConfiguration } from "../application-config";

class ApplicationGenerator {

    private appConfig: ApplicationConfiguration;

    constructor(appConfig: ApplicationConfiguration) {
        this.appConfig = appConfig;
    }

    generate() {
        // get application configuration
        // foreach Pair<Capability, Aggregate> from application configuration:
            // generate data access layer artefacts
                // construct a DataAccessLayerGenerator instance based on config (i.e. LdkitGenerator, JsonDataAccessGenerator ...)
                    // TODO: think about passing correct path as parameter for the generated artefacts

            // generate application layer artefacts
                // construct a ApplicationLayerGenerator instance based on

            // generate frontend artefacts

        // aggregate artefacts into an application
            // use generated artefacts to construct an app landing page, links / react routers ...
    }
}
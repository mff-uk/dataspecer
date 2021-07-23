import {CoreModelReader} from "../core/api/model-reader";
import {CoreModelWriter} from "../core/api/model-writer";
import {RdfSource} from "../io/rdf/rdf-api";
import {CoreResource} from "../core/model";
import {CoreEvent} from "../core/event/core-event";

class MemoryCoreModel implements CoreModelReader, CoreModelWriter {

  /**
   * All events.
   */
  private events: CoreEvent[] = [];

  /**
   * All resources in the model.
   */
  private resources: {[iri:string]: CoreResource} = {};

  async listResources(): Promise<string[]> {
    return Object.keys(this.resources);
  }

  async readResources(iri: string): Promise<CoreResource> {
    // We may need to create a deep copy here.
    return this.resources[iri];
  }

  async updateModel(event: CoreEvent): Promise<string[]> {
    return Promise.resolve([]);
  }

}

/**
 * @param source Data source.
 * @param iri IRI of the root event.
 */
export async function createMemoryModel(
  source: RdfSource, iri: string
): Promise<MemoryCoreModel> {
  //
}

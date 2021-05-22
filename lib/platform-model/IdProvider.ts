/**
 * Generates ID of entities based on their interpretation and context.
 */
export default interface IdProvider {
    /**
     * Generates IDs for PIM entities based on their CIM interpretation
     * @param pimId
     */
    pimFromCim(pimId: string): string;
}
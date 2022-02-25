export interface DataStructure {
    id: string;
    name?: string;
    store: string;

    artifact_xml: boolean;
    artifact_json: boolean;
    artifact_csv: boolean;
}

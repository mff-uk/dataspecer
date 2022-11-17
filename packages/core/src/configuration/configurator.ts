export interface Configurator {
    getFromObject(configurationObject: object): object;

    setToObject(configurationObject: object, options: object): object;

    merge(...options: object[]): object;

    getDefault(): object;
}

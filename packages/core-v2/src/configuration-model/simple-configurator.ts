import { ReadableConfigurationModel, WritableConfigurationModel } from "./model";
import { mergePatch } from "./utils";

export function interpretConfigurationModelSimple<T extends any>(configuration: ReadableConfigurationModel, key: string, initialValue: any = {}): T {
  const rawData = configuration.getRawData()[key] ?? {};
  return mergePatch(initialValue, rawData) as T;
}

export function applyConfigurationModelSimple(configuration: WritableConfigurationModel, key: string, data: any) {
  const rawData = configuration.getRawData();
  configuration.setRawData({
    ...rawData,
    [key]: data
  });
}
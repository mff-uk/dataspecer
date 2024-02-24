import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";
import { readFileSync } from 'fs';
import { join } from 'path';

const testType = "targetCase2";
const modelCreator = new TargetCase2ModelCreator();

test('Shex map creation test - targetCase2', async () => {

  const shexMapOutput = await Support.shexMapTest(modelCreator);
  const shexMapExpectedOutput = readFileSync(join(__dirname, "./shexMaps/" + testType + "ShexQueryMap.txt"), 'utf-8');
  expect(shexMapOutput).toBe(shexMapExpectedOutput);
});
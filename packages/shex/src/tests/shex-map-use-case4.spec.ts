import * as Support from "./support/testSupport";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";
import { readFileSync } from 'fs';
import { join } from 'path';

const testType = "targetCase4";
const modelCreator = new TargetCase4ModelCreator();

test('Shex map creation test - targetCase4', async () => {

  const shexMapOutput = await Support.shexMapTest(modelCreator);
  const shexMapExpectedOutput = readFileSync(join(__dirname, "./shexMaps/" + testType + "ShexQueryMap.txt"), 'utf-8');
  expect(shexMapOutput).toBe(shexMapExpectedOutput);
});
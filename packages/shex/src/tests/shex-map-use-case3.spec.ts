import * as Support from "./support/testSupport.ts";
import TargetCase3ModelCreator from "./support/TargetCase3ModelCreator.ts";
import { readFileSync } from 'fs';
import { join } from 'path';

const testType = "targetCase3";
const modelCreator = new TargetCase3ModelCreator();

test('Shex map creation test - targetCase3', async () => {

  const shexMapOutput = await Support.shexMapTest(modelCreator);
  const shexMapExpectedOutput = readFileSync(join(__dirname, "./shexMaps/" + testType + "ShexQueryMap.txt"), 'utf-8');
  expect(shexMapOutput).toBe(shexMapExpectedOutput);
});
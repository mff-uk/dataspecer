import * as Support from "./support/testSupport.ts";
import TargetCase1ModelCreator from "./support/TargetCase1ModelCreator.ts";
import { readFileSync } from 'fs';
import { join } from 'path';

const testType = "targetCase1";
const modelCreator = new TargetCase1ModelCreator();

test('Shex map creation test - targetCase1', async () => {

  const shexMapOutput = await Support.shexMapTest(modelCreator);
  const shexMapExpectedOutput = readFileSync(join(__dirname, "./shexMaps/" + testType + "ShexQueryMap.txt"), 'utf-8');
  expect(shexMapOutput).toBe(shexMapExpectedOutput);
});
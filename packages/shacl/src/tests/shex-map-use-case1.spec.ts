import * as Support from "./support/testSupport";
import TargetCase1ModelCreator from "./support/TargetCase1ModelCreator";
import { readFileSync } from 'fs';
import { join } from 'path';

const testType = "targetCase1";
const modelCreator = new TargetCase1ModelCreator();

test('Shex map creation test - targetCase1', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexMapOutput = await Support.shexMapTest(modelCreator);
  console.log(shexMapOutput);
  const shexMapExpectedOutput = readFileSync(join(__dirname, "./shexMaps/" + testType + "ShexQueryMap.txt"), 'utf-8');
  expect(shexMapOutput).toBe(shexMapExpectedOutput);
});
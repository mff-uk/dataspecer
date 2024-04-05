import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/OptionalModelCreator";
import * as fs from "fs";

const testType = "instancesTypingOptional";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - instancesTypingOptional syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("a [<https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/adresa>] ?");
});
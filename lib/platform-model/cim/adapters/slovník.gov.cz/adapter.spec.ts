import SlovnikGovCzAdapter from ".";
import IdProvider from "./IdProvider";

test("slovník.gov.cz: IdProvider", async () => {
  const input = "https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/orgán-veřejné-moci";
  const provider = new IdProvider();
  expect(provider.pimFromCim(input)).toBe("https://localhost/pim/slovník.gov.cz/legislativní/sbírka/111/2009/pojem/orgán-veřejné-moci");
});

test("slovník.gov.cz: search method", async () => {
  const adapter = new SlovnikGovCzAdapter(new IdProvider());
  const query = "řidič";
  const result = await adapter.search(query);
  expect(result.map(cls => cls.pimHumanLabel?.cs)).toContain("Řidičský průkaz České republiky");
});

test("slovník.gov.cz: getClass method", async () => {
  const adapter = new SlovnikGovCzAdapter(new IdProvider());
  const queries: [string, boolean][] = [
    ["https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba", true],
    ["https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/fyzická-osoba", true],
    ["https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno", false],
    ["https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/řídí-vozidlo", false],
  ];
  const result = [];
  for (const [query, expected] of queries) {
    result.push(!!await adapter.getClass(query));
  }

  expect(result).toStrictEqual(queries.map(([,expected]) => expected));
});

test("slovník.gov.cz: getSurroundings method", async () => {
  const adapter = new SlovnikGovCzAdapter(new IdProvider());
  const queries = [
    "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba",
    "https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/fyzická-osoba",
  ];

  for (const query of queries) {
    const result = await adapter.getSurroundings(query);
    console.log(result);
  }
});

test("slovník.gov.cz: combined search + surroundings", async () => {
  const a = performance.now();
  const adapter = new SlovnikGovCzAdapter(new IdProvider());
  const query = "řidič";


  const searchResult = await adapter.search(query);
  const b = performance.now();
  const result = await Promise.all(searchResult.map(cls => adapter.getSurroundings(cls.id)));
  const c = performance.now();

  console.log(result);
});
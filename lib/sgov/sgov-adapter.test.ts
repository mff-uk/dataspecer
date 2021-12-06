import {SgovAdapter} from "./sgov-adapter";
import {httpFetch} from "../io/fetch/fetch-nodejs";
import {PimClass} from "../pim/model";
import {CimAdapter, IriProvider, PrefixIriProvider} from "../cim";
import {FetchOptions} from "../io/fetch/fetch-api";
import {CoreResourceReader} from "../core";

let iriProvider: IriProvider;
let adapter: CimAdapter;

beforeAll(() => {
  iriProvider = new PrefixIriProvider();
  adapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
  adapter.setIriProvider(iriProvider);
});

test("SgovAdapter.search()", async () => {
  const query = "řidič";
  const result = await adapter.search(query);
  expect(result.map(cls => cls.pimHumanLabel?.cs))
    .toContain("Řidičský průkaz České republiky");
}, 10 * 60 * 1000);

describe("SgovAdapter.getClass()", () => {
  test("existing class", async () => {
    const query = "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba";
    const cls = await adapter.getClass(query) as PimClass;

    expect(cls.pimHumanLabel?.en).toEqual("Natural Person");
    expect(cls.pimHumanDescription?.en)
      .toEqual("Natural Person is a human as a legal subject.");
  }, 10 * 60 * 1000);

  test("non existing class", async () => {
    const query = "https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno";
    const cls = await adapter.getClass(query);

    expect(cls).toBeNull();
  }, 10 * 60 * 1000);

  test("is codelist", async () => {
    const query = "https://slovník.gov.cz/legislativní/sbírka/343/2014/pojem/palivo-jako-položka-číselníku";
    const cls = await adapter.getClass(query) as PimClass;
    expect(cls.pimIsCodelist).toBeTruthy();
  }, 10 * 60 * 1000);

  test("is not codelist", async () => {
    const query = "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/vozidlo";
    const cls = await adapter.getClass(query) as PimClass;
    expect(cls.pimIsCodelist).toBeFalsy();
  }, 10 * 60 * 1000);
});


describe("SgovAdapter.getSurroundings()", () => {
  const query = "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba";
  let store: CoreResourceReader;

  beforeAll(async () => {
    store = await adapter.getSurroundings(query);
  });

  test("inheritance", async () => {
    const root =
      await store.readResource(iriProvider.cimToPim(query)) as PimClass;

    expect(root.pimExtends).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/veřejný-sektor/pojem/člověk",
      "https://slovník.gov.cz/veřejný-sektor/pojem/subjekt-práva",
    ].map(iriProvider.cimToPim)));
  });

  test("attributes", async () => {
    const resources = await store.listResources();

    expect(resources).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/veřejný-sektor/pojem/příjmení",
      "https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno",
    ].map(iriProvider.cimToPim)));
  });

  test("associations", async () => {
    const resources = await store.listResources();

    expect(resources).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/"
      + "dopustil-se-přestupku-řízení-technicky-nezpůsobilého-vozidla",
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/přestupek",
    ].map(iriProvider.cimToPim)));
  });
});

describe("SgovAdapter.getClassGroup()", () => {
  test("uncached", async () => {
    // New instance of the adapter need to be created
    const adapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    adapter.setIriProvider(iriProvider);
    const groups = await adapter.getResourceGroup(
      "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
    expect(groups).toContain("https://slovník.gov.cz/veřejný-sektor/glosář");
  });

  test("cached by get class", async () => {
    const fetchContainer = {fetch: httpFetch};
    const proxyFetch = (url: string, fetchOptions: FetchOptions) =>
      fetchContainer.fetch(url, fetchOptions);
    const adapter = new SgovAdapter(
      "https://slovník.gov.cz/sparql", proxyFetch);
    adapter.setIriProvider(iriProvider);

    await adapter.getClass(
      "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");

    // @ts-ignore
    fetchContainer.fetch = () => {
      throw new Error("Fetch called.");
    };

    const groups = await adapter.getResourceGroup(
      "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
    expect(groups).toContain("https://slovník.gov.cz/veřejný-sektor/glosář");
  });

  test("cached by search", async () => {
    const fetchContainer = {fetch: httpFetch};
    const proxyFetch = (url: string, fetchOptions: FetchOptions) =>
      fetchContainer.fetch(url, fetchOptions);
    const adapter = new SgovAdapter(
      "https://slovník.gov.cz/sparql", proxyFetch);
    adapter.setIriProvider(iriProvider);

    await adapter.search("řidič");

    // @ts-ignore
    fetchContainer.fetch = () => {
      throw new Error("Fetch called.");
    };

    const groups = await adapter.getResourceGroup(
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/řidič");
    expect(groups).toContain(
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/glosář");
  });
});

import {SgovAdapter} from "./sgov-adapter";
import {httpFetch} from "../io/fetch/rdf-fetch-nodejs";
import {PimClass} from "../platform-independent-model/model";
import {ReadOnlyMemoryStore} from "../core/store/memory-store/read-only-memory-store";
import {PrefixIdProvider} from "../cim/prefix-id-provider";
import {IdProvider} from "../cim/id-provider";
import {CimAdapter} from "../cim";
import {FetchOptions} from "../io/fetch/fetch-api";

let idProvider: IdProvider;
let adapter: CimAdapter;

beforeAll(() => {
  idProvider = new PrefixIdProvider();
  adapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch, idProvider);
});

test("SgovAdapter.search()", async () => {
  const query = "řidič";
  const result = await adapter.search(query);
  expect(result.map(cls => cls.pimHumanLabel?.cs)).toContain("Řidičský průkaz České republiky");
}, 10 * 60 * 1000);

describe("SgovAdapter.getClass()", () => {
  test("existing class", async () => {
    const query = "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba";
    const cls = await adapter.getClass(query) as PimClass;

    expect(cls.pimHumanLabel?.en).toEqual("Natural Person");
    expect(cls.pimHumanDescription?.en).toEqual("Natural Person is a human as a legal subject.");
  }, 10 * 60 * 1000);

  test("non existing class", async () => {
    const query = "https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno";
    const cls = await adapter.getClass(query);

    expect(cls).toBeNull();
  }, 10 * 60 * 1000);
});


describe("SgovAdapter.getSurroundings()", () => {
  const query = "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba";
  let store: ReadOnlyMemoryStore;

  beforeAll(async () => {
    store = await adapter.getSurroundings(query);
  });

  test("inheritance", async () => {
    const root = await store.readResource(idProvider.cimToPim(query)) as PimClass;

    expect(root.pimExtends).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/veřejný-sektor/pojem/člověk",
      "https://slovník.gov.cz/veřejný-sektor/pojem/subjekt-práva",
    ].map(idProvider.cimToPim)));
  });

  test("attributes", async () => {
    const resources = await store.listResources();

    expect(resources).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/veřejný-sektor/pojem/příjmení",
      "https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno",
    ].map(idProvider.cimToPim)));
  });

  test("associations", async () => {
    const resources = await store.listResources();

    expect(resources).toEqual(expect.arrayContaining([
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/dopustil-se-přestupku-řízení-technicky-nezpůsobilého-vozidla",
      "https://slovník.gov.cz/legislativní/sbírka/361/2000/pojem/přestupek",
    ].map(idProvider.cimToPim)));
  });
});

describe("SgovAdapter.getClassGroup()", () => {
  test("uncached", async () => {
    // New instance of the adapter need to be created
    const adapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch, idProvider);
    const groups = await adapter.getClassGroup("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
    expect(groups).toContain("https://slovník.gov.cz/veřejný-sektor/glosář");
  });

  test("cached", async () => {
    const fetchContainer = {fetch: httpFetch};
    const proxyFetch = (url: string, fetchOptions: FetchOptions) => fetchContainer.fetch(url, fetchOptions);
    const adapter = new SgovAdapter("https://slovník.gov.cz/sparql", proxyFetch, idProvider);

    await adapter.getClass("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");

    fetchContainer.fetch = () => {
      throw new Error("Fetch called.");
    };

    const groups = await adapter.getClassGroup("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
    expect(groups).toContain("https://slovník.gov.cz/veřejný-sektor/glosář");
  });
});

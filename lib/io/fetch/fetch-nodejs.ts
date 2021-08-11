const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetchApi = isBrowser && typeof fetch !== "undefined" ? fetch : require("./rdf-fetch-nodejs").default;

export default fetchApi;

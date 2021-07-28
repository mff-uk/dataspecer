const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const fetchApi = isBrowser && typeof fetch !== 'undefined' ? fetch : require('./rdf-fetch-nodejs').default;

export default fetchApi;

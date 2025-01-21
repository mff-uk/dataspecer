
const PACKAGE_IDENTIFIER = "package-id";

const VIEW_IDENTIFIER = "view-id";

export function parseUrlQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    package: searchParams.get(PACKAGE_IDENTIFIER),
    view: searchParams.get(VIEW_IDENTIFIER),
  };
}

export function updateUrlQuery(nextPackage: string | null, newView: string | null) {
  const searchParams = new URLSearchParams(window.location.search);
  if (nextPackage === null) {
    searchParams.delete(PACKAGE_IDENTIFIER);
  } else {
    searchParams.set(PACKAGE_IDENTIFIER, nextPackage);
  }
  if (newView === null) {
    searchParams.delete(VIEW_IDENTIFIER);
  } else {
    searchParams.set(VIEW_IDENTIFIER, newView);
  }
  window.history.replaceState(null, "", "?" + searchParams.toString());
}

export const RETURN_BACK_URL_KEY = "returnUrl";
export const RETURN_BACK_URL_NAME_KEY = "returnUrlName";

export function initReturnBack() {
    const params = (new URL(document.location.href)).searchParams;
    const url = params.get(RETURN_BACK_URL_KEY);
    const name = params.get(RETURN_BACK_URL_NAME_KEY);

    if (url) {
        window.sessionStorage.setItem(RETURN_BACK_URL_KEY, JSON.stringify(url));
        window.sessionStorage.setItem(RETURN_BACK_URL_NAME_KEY, JSON.stringify(name));

        // Delete from current URL
        params.delete(RETURN_BACK_URL_KEY);
        params.delete(RETURN_BACK_URL_NAME_KEY);
        // eslint-disable-next-line no-restricted-globals
        history.replaceState(null, "", `${document.location.pathname}?${params}`);
    }
}

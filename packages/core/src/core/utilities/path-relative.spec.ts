import {pathRelative} from "./path-relative";

describe("pathRelative() util function", () => {
    test("absolute filesystem paths", () => {
        expect(pathRelative("/a/b/c", "/a/b/c")).toBe(".");
        expect(pathRelative("/a/b/c", "/a/b/d")).toBe("d");
        expect(pathRelative("/a/b/c", "/a/x")).toBe("../x");
        expect(pathRelative("/a/b/c", "/a/x/y")).toBe("../x/y");

        // from c file to this directory
        expect(pathRelative("/a/b/c", "/a/b")).toBe(".");
        expect(pathRelative("/a/b/c", "/a/b/")).toBe(".");

        expect(pathRelative("/a/b/c", "/a/")).toBe("../");
    });
});

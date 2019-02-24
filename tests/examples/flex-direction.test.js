const path = require("path");
const { parseFile, getStyleAttributeValuesMap } = require("../utils/parser-utils");

const examplesPath = path.resolve("examples", "input-outputs");

describe("flex direction related output", () => {
    describe("when input layers laid in column", () => {
        let valuesObject;
        beforeAll(() => {
            const output = parseFile(path.join(examplesPath, "flex-direction", "column", "1", "output.jsx"));
            const [jsxNode] = output;
            valuesObject = getStyleAttributeValuesMap(jsxNode);
        });

        it("should have a flex container", () => {
            expect(valuesObject.display).toBe("flex");
        });

        it("should have flexDirection column", () => {
            expect(valuesObject.flexDirection).toBe("column");
        });
    });

    describe("when input layers laid in row", () => {
        let valuesObject;
        beforeAll(() => {
            const output = parseFile(path.join(examplesPath, "flex-direction", "row", "1", "output.jsx"));
            const [jsxNode] = output;
            valuesObject = getStyleAttributeValuesMap(jsxNode);
        });

        it("should have a flex container", () => {
            expect(valuesObject.display).toBe("flex");
        });

        it("should have flexDirection row", () => {
            expect(valuesObject.flexDirection).toBe("row");
        });
    });
});
const parser = require("@babel/parser");
const path = require("path");
const fs = require("fs");

const examplesPath = path.resolve("examples", "input-outputs");

function parseFile(filePath) {
    const file = fs.readFileSync(filePath).toString();
    return parser.parse(file, { plugins: ["jsx"] }).program.body;
}

function getStyleAttribute(node) {
    return node.expression.openingElement.attributes.find(attr => attr.name.name === "style");
}

function getStyleAttributeValues(styleAttributeNode) {
    return styleAttributeNode.value.expression.properties;
}

function mapStyleAttributeValuesToObject(styleAttributeValues) {
    return styleAttributeValues.reduce((acc, value) => {
        acc[value.key.name] = value.value.value;
        return acc;
    }, {})
}

function getStyleAttributeValuesMap(jsxNode) {
    const styleAttributeNode = getStyleAttribute(jsxNode);
    const values = getStyleAttributeValues(styleAttributeNode);
    return mapStyleAttributeValuesToObject(values);
}

describe("output", () => {
    describe("when input layers laid of in column", () => {
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
});
const parser = require("@babel/parser");
const fs = require("fs");

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

module.exports = {
    parseFile,
    getStyleAttributeValuesMap
};
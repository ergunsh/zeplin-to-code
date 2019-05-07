const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-babylon")];

const styleValueMapping = require("./style-value-mapping");
const tokens = require("./tokens");
const example = `.{.block.static.row.nowrap.|.block.static.row.nowrap.{.block.static.row.nowrap.}.}`;

function getRuleFromToken(token) {
    const properties = Object.keys(styleValueMapping);
    for (let property of properties) {
        const valueMapOfProperty = styleValueMapping[property];
        const valuesOfProperty = Object.keys(valueMapOfProperty);
        for (let value of valuesOfProperty) {
            const tokenValue = valueMapOfProperty[value];
            if (tokenValue === token) {
                return {
                    property,
                    value
                };
            }
        }
    }
}

function convertTokenToStyle(token, isBlock) {
    const { property, value } = getRuleFromToken(token);
    return `"${property}": "${value}"`;
}

function generateView(tokens, hasChildren) {
    const isBlock = tokens.includes(".block");
    let tokensInConsideration = tokens;
    if (isBlock) {
        tokensInConsideration = tokens.filter(token => {
            const { property } = getRuleFromToken(token);
            return !property.includes("flex");
        });
    }
    const styleAttribute = tokens.length ? ` style={{ ${tokensInConsideration.map(token => convertTokenToStyle(token)).join(", ")} }}` : "";
    return `<div${styleAttribute}${hasChildren ? "" : "/"}>`;
}

function generateCodeFromParseTree(node) {
    if (!node.children.length) {
        return generateView(node.styleTokens);
    }

    return `${generateView(node.styleTokens, true)}${node.children.map(generateCodeFromParseTree).join("")}</div>`;
}

class Node {
    constructor() {
        this.parent = null;
        this.children = [];
        this.styleTokens = [];
    }
}

function getParseTree(text) {
    const textTokens = text.split(".").filter(Boolean).map(tokenWithoutDot => `.${tokenWithoutDot}`);
    const root = new Node();
    let itNode = root;

    function advanceToken() {
        const token = textTokens.shift();
        if (!token) {
            return;
        }

        switch (token) {
            case tokens.LEFT_BRACKET:
                leftBracket(token);
                break;
            case tokens.RIGHT_BRACKET:
                rightBracket(token);
                break;
            case tokens.SIBLING_SEP:
                siblingSep(token);
                break;
            case tokens.STOP:
                break;
            default:
                styleToken(token);
                break;
        }
    }

    function leftBracket() {
        const newNode = new Node();
        newNode.parent = itNode;
        itNode.children.push(newNode);
        itNode = newNode;

        advanceToken();
    }

    function rightBracket() {
        itNode = itNode.parent;
        advanceToken();
    }

    function siblingSep() {
        const newNode = new Node();
        newNode.parent = itNode.parent;
        itNode.parent.children.push(newNode);
        itNode = newNode;

        advanceToken();
    }

    function styleToken(token) {
        itNode.styleTokens.push(token);
        advanceToken();
    }

    advanceToken();
    return root;
}

module.exports = dslCode => {
    const root = getParseTree(dslCode);
    const code = generateCodeFromParseTree(root);
    return prettier.format(code, { parser: "babel", plugins });
};

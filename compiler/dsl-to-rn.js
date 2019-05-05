const styleValueMapping = require("./style-value-mapping");
const tokens = require("./tokens");
const example = `.{.block.static.row.nowrap.}`;

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

function convertTokenToStyle(token) {
    const { property, value } = getRuleFromToken(token);
    return `${property}: "${value}"`;
}

function generateView(tokens, children) {
    return `
        <View style={{ ${tokens.map(token => convertTokenToStyle(token)).join(", ")} }} ${!children ? "/" : ""}>
    `;
}

function compileFromDSL(text) {
    const textTokens = text.split(".").filter(Boolean).map(tokenWithoutDot => `.${tokenWithoutDot}`);
    let token;

    function advanceToken() {
        token = textTokens.shift();
        if (!token) {
            return;
        }

        switch (token) {
            case tokens.LEFT_BRACKET:
                leftBracket();
                break;
            case tokens.RIGHT_BRACKET:
                rightBracket();
                break;
            case tokens.SIBLING_SEP:
                siblingSep();
                break;
            default:
                styleToken();
                break;
        }
    }

    function leftBracket() {
        console.log("left bracket");
        advanceToken();
    }

    function rightBracket() {
        console.log("right bracket");
        advanceToken();
    }

    function siblingSep() {
        console.log("sibling sep");
    }

    function styleToken() {
        console.log("style token", token);
        advanceToken();
    }

    advanceToken();
}

compileFromDSL(example);
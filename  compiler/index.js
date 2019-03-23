const puppeteer = require("puppeteer");
const tokens = require("./tokens");
const exampleDataset = require("../scraper/dataset/about.google/intl/tr/index.json");
const exampleMarkup = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center"></div>`;

function getDSL(tokens, parent) {
    const computedStyle = getComputedStyle(parent);
    const display = computedStyle["display"];
    const flexDirection = computedStyle["flex-direction"];
    const flexWrap = computedStyle["flex-wrap"];
    const justifyContent = computedStyle["justify-content"];
    const alignItems = computedStyle["align-items"];

    function transformDisplay(property) {
        if (property === "block") {
            return tokens.BLOCK;
        }

        if (property === "flex") {
            return tokens.FLEX;
        }

        if (property === "inline") {
            return tokens.INLINE;
        }

        if (property === "inline-block") {
            return tokens.INLINE_BLOCK;
        }

        return "";
    }

    function transformFlexDirection(property) {
        if (property === "row") {
            return tokens.ROW;
        }

        if (property === "column") {
            return tokens.COLUMN;
        }

        return "";
    }

    function transformFlexWrap(property) {
        if (property === "wrap") {
            return tokens.WRAP;
        }

        if (property === "nowrap") {
            return tokens.NOWRAP;
        }

        return "";
    }

    function transformJustifyContent(property) {
        if (property === "flex-start") {
            return tokens.J_FLEX_START;
        }

        if (property === "flex-end") {
            return tokens.J_FLEX_END;
        }

        if (property === "center") {
            return tokens.J_CENTER;
        }

        if (property === "space-between") {
            return tokens.J_SPACE_BETWEEN;
        }

        if (property === "space-around") {
            return tokens.J_SPACE_AROUND;
        }

        if (property === "space-evenly") {
            return tokens.J_SPACE_EVENLY;
        }

        return "";
    }

    function transformAlignItems(property) {
        switch (property) {
            case "flex-start":
                return tokens.AI_FLEX_START;
            case "flex-end":
                return tokens.AI_FLEX_END;
            case "center":
                return tokens.AI_CENTER;
            case "strecth":
                return tokens.AI_STRETCH;
            case "baseline":
                return tokens.AI_BASELINE;
        }

        return "";
    }

    let dsl = `${transformDisplay(display)}${transformFlexDirection(flexDirection)}${transformFlexWrap(flexWrap)}${transformJustifyContent(justifyContent)}${transformAlignItems(alignItems)}`;
    const childrenDSL = Array.prototype.map.call(parent.children, child => getDSL(tokens, child)).join("|");
    if (childrenDSL) {
        dsl += `{${childrenDSL}}`;
    }

    return dsl;
}

async function decompile(markup) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(markup);
    page.on("console", msg => console.log(msg.text()));
    const content = await page.evaluate((tokens, getDSLFnText) => {
        const parent = document.body.firstChild;
        const getDSLInPage = new Function(`return (${getDSLFnText}).apply(null, arguments)`);
        const dsl = getDSLInPage(tokens, parent);
        return dsl;
    }, tokens, getDSL.toString());
    console.log(content);
    await page.close();
    await browser.close();
}

decompile(exampleMarkup);
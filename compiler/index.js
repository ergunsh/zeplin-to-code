const puppeteer = require("puppeteer");
const tokens = require("./tokens");
const mapping = require("./style-value-mapping");
const getPageOpener = require("../scraper/utils/pageOpener");
const fs = require("fs-extra");
const find = require("find");
const { Semaphore } = require("await-semaphore");
const chalk = require("chalk");
const path = require("path");
const datasetDir = "./scraper/dataset";

function findFile(file, location) {
    return new Promise(resolve => {
        find.file(file, location, resolve);
    });
}

function getDSL(tokens, mapping, parent) {
    const computedStyle = getComputedStyle(parent);
    let dsl = "";
    for (let propertyName of computedStyle) {
        const value = computedStyle[propertyName];
        dsl += (mapping[propertyName] && mapping[propertyName][value]) || "";
    }

    const childrenDSL = Array.prototype.map.call(parent.children, child => getDSL(tokens, mapping, child)).join("|");
    if (childrenDSL) {
        dsl += `{${childrenDSL}}`;
    }

    return dsl;
}

function generateDSLFromPage(page) {
    return page.evaluate((tokens, mapping, getDSLFnText) => {
        const getDSLInPage = new Function(`return (${getDSLFnText}).apply(null, arguments)`);
        const dsl = getDSLInPage(tokens, mapping, document.body);
        const bodyRect = {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
        return { dsl, bodyRect };
    }, tokens, mapping, getDSL.toString());
}

async function getDecompiler({
    outputDirectory = "out-with-position/",
    maxPages
} = {}) {
    const browser = await puppeteer.launch();
    const pageOpener = getPageOpener({
        browser,
        maxPages
    });
    const fileOpenSemaphore = new Semaphore(10);

    async function decompileOutput(output, viewport) {
        const page = await pageOpener.open();
        const { rects, markup } = output;
        await page.setContent(markup);
        page.on("console", msg => console.log(msg.text()));
        try {
            const { dsl, bodyRect } = await generateDSLFromPage(page);
            await pageOpener.close(page);
            return {
                x: rects,
                y: dsl,
                viewport,
                bodyRect,
                markup
            };
        } catch (e) {
            await pageOpener.close(page);
            throw e;
        }
    }

    let numberOfSaved = 0
    async function decompileFile(filePath, fileIndex) {
        const release = await fileOpenSemaphore.acquire();
        const fileContent = await fs.readFile(filePath);
        const fileObj = JSON.parse(fileContent);
        const promises = fileObj.outputs.map((output, index) => {
            return decompileOutput(output, fileObj.viewport).then(data => {
                const outputPath = path.resolve(__dirname, outputDirectory, `data-${fileIndex}-${index}.json`);
                // const outputPath = `${outputDirectory}/data-${index}.json`;
                fs.outputFile(outputPath, JSON.stringify(data)).then(() => {
                    console.log(chalk.green("SAVED"), outputPath, chalk.blue.bold(++numberOfSaved));
                });
            }).catch(err => {
                console.error(err);
            });
        });
        Promise.all(promises).then(release).catch(release);
    }

    return async function decompile() {
        const files = await findFile(/.*\.json$/, datasetDir);
        files.forEach((file, index) => {
            try {
                decompileFile(file, index)
            } catch (e) {
                console.error(e);
            }
        });
    }
}

getDecompiler({
    maxPages: 50
}).then(decompile => {
    decompile();
})
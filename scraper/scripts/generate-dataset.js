const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const find = require("find");
const path = require("path");
const chalk = require('chalk');
const { Semaphore } = require("await-semaphore");
const waitUntil = require("async-wait-until");

const outputDirectory = "dataset-body-2/";
const filesLocation = "out";
// const filesLocation = "/Users/ergunerdogmus/Desktop/outbiggoogle";

let browserReady = false;
function isBrowserReady() {
    return browserReady;
}

function findFile(file, location) {
    return new Promise(resolve => {
        find.file(file, location, resolve);
    });
}

function getRectsAndMarkupInPage(div) {
    function getRectangles(parent) {
        const parentRect = parent.getBoundingClientRect().toJSON();
        let rectArr = [parentRect];
        for (let child of parent.children) {
            rectArr = rectArr.concat(getRectangles(child));
        }

        return rectArr;
    }

    return { rects: getRectangles(div), markup: div.innerHTML };
}

let numberOfSaved = 0;
function saveDatasetToDisk(filepath, content) {
    return new Promise((resolve, reject) => {
        fs.outputFile(filepath, content, err => {
            if (err) {
                reject(err);
            }
            console.log(chalk.green("SAVED"), filepath, chalk.blue.bold(++numberOfSaved));
            resolve();
        });
    })
}

let browser;
function generateDataset(outputFilename, htmlContent) {
    let openedPage;
    return waitUntil(isBrowserReady)
        .then(() => browser.newPage())
        .then(page => {
            openedPage = page;
            console.log(chalk.blue("OPENED"), outputFilename);
            return page.setContent(htmlContent);
        })
        .then(() => {
            return openedPage.evaluate(fnText => {
                const getRectsAndMarkup = new Function(`return (${fnText}).apply(null, arguments)`);
                const tags = "div,section,article,nav,header,footer";
                // const divs = document.querySelectorAll(tags);
                const outputs = [getRectsAndMarkup(document.body)];
                // for (let div of divs) {
                //     outputs.push(getRectsAndMarkup(div));
                // }
                const bodyRect = document.body.getBoundingClientRect().toJSON();
                return { viewport: { width: bodyRect.width, height: bodyRect.height }, outputs };
            }, getRectsAndMarkupInPage.toString());
        })
        .then(obj => saveDatasetToDisk(outputFilename, JSON.stringify(obj)))
        .then(() => {
            openedPage.close()
        })
        .catch(err => {
            console.error("error in generateDateset", err);
            if (openedPage) {
                openedPage.close();
            }
        });
}

function createDataFromFile(fileReaderSemaphore, file) {
    let releaseInBlock;
    const outputFilename = path.join(outputDirectory, file.replace(".html", ".json").replace(filesLocation, ""));

    return fileReaderSemaphore.acquire()
        .then(release => {
            console.log(chalk.redBright("ACQUIRED"), file);
            releaseInBlock = release;
            return fs.readFile(file, { encoding: "utf8" });
        })
        .then(htmlContent => generateDataset(outputFilename, htmlContent))
        .then(() => {
            console.log(chalk.magenta("RELEASED"), outputFilename);
            releaseInBlock();
        })
        .catch(err => {
            console.error(err);
            console.log(chalk.magenta("RELEASED"), outputFilename);
            if (!browser) {
                startBrowser();
            }
            return releaseInBlock();
        });
}

function startBrowser() {
    if (browser) {
        browser.close();
    }

    return puppeteer.launch().then(newBrowser => {
        browser = newBrowser;
        browserReady = true;
        browser.on("disconnected", () => {
            browserReady = false;
            startBrowser();
        })
    });
}

function getHTMLs() {
    const fileReaderSemaphore = new Semaphore(10);
    startBrowser()
        .then(() => findFile(/.*\.html/, filesLocation))
        .then(files => Promise.all(files.slice(2806).map(file => createDataFromFile(fileReaderSemaphore, file))))
        .then(() => browser.close())
        .catch(err => {
            console.error("Error in getHTMLs", err);
            return browser.close();
        });
}

getHTMLs();
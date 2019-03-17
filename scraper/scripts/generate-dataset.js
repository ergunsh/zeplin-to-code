const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const find = require("find");
const path = require("path");
const chalk = require('chalk');
const { Semaphore } = require("await-semaphore");

const outputDirectory = "dataset/";
const filesLocation = "/Users/ergunerdogmus/Desktop/outbiggoogle";

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

function saveDatasetToDisk(filepath, content) {
    return new Promise((resolve, reject) => {
        fs.outputFile(filepath, content, err => {
            if (err) {
                reject(err);
            }
            console.log(chalk.green("SAVED"), filepath);
            resolve();
        });
    })
}

async function generateDataset(browser, outputFilename, htmlContent) {
    let openedPage;
    return browser.newPage()
        .then(page => {
            openedPage = page;
            console.log(chalk.blue("OPENED"), outputFilename);
            return page.setContent(htmlContent);
        })
        .then(() => {
            return openedPage.evaluate(fnText => {
                const getRectsAndMarkup = new Function(`return (${fnText}).apply(null, arguments)`);
                const divs = document.querySelectorAll("div");
                const outputs = [];
                for (let div of divs) {
                    outputs.push(getRectsAndMarkup(div));
                }
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
            openedPage.close();
        });
}

function createDataFromFile(browser, fileReaderSemaphore, file) {
    let releaseInBlock;
    const outputFilename = path.join(outputDirectory, file.replace(".html", ".json").replace(filesLocation, ""));

    return fileReaderSemaphore.acquire()
        .then(release => {
            console.log(chalk.redBright("ACQUIRED"), file);
            releaseInBlock = release;
            return fs.readFile(file, { encoding: "utf8" });
        })
        .then(htmlContent => generateDataset(browser, outputFilename, htmlContent))
        .then(() => {
            console.log(chalk.magenta("RELEASED"), outputFilename);
            releaseInBlock();
        })
        .catch(err => {
            console.error(err);
            console.log(chalk.magenta("RELEASED"), outputFilename);
            return releaseInBlock();
        });
}

function getHTMLs() {
    const fileReaderSemaphore = new Semaphore(10);
    let openedBrowser;
    Promise.all([puppeteer.launch(), findFile(/.*\.html/, filesLocation)])
        .then(([browser, files]) => {
            openedBrowser = browser;
            return Promise.all(files.map(file => createDataFromFile(browser, fileReaderSemaphore, file)));
        })
        .then(() => {
            openedBrowser.close
        })
        .catch(err => {
            console.error("Error in getHTMLs", err);
            return openedBrowser.close();
        })
}

getHTMLs();
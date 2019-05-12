const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const url = require("url");
const path = require("path");
const entries = require("./top-1m.js");
const getPageOpener = require("../utils/pageOpener");

function inlineStyle(element, options = {}) {
    if (!element) {
        throw new Error("No element specified.");
    }

    if (options.recursive) {
        for (let child of element.children) {
            inlineStyle(child, options);
        }
    }

    const computedStyle = getComputedStyle(element);
    const properties = options.properties || computedStyle;
    for (let property of properties) {
        element.style[property] = computedStyle.getPropertyValue(property);
    }
}

function getLinksInPage(page) {
    return page.$$eval("a", as => {
        const linksInPage = [];
        for (const a of as) {
            linksInPage.push(a.href);
        }
        return linksInPage.filter(Boolean);
    });
}

function inlineStylesInPage(page) {
    return page.evaluate(inlineStyleFnText => {
        const inlineStyleInPage = new Function(`return (${inlineStyleFnText}).apply(null, arguments)`);
        inlineStyleInPage(document.body, {
            recursive: true
        });
    }, inlineStyle.toString());
}

function sanitizeFilepath (filePath) {
	filePath = path.normalize(filePath);
	let pathParts = filePath.split(path.sep);
	return pathParts.join(path.sep);
}

function generateFilename(link) {
    const parsedURL = url.parse(link);
    const host = parsedURL.host
    let filePath;
    try {
        filePath = decodeURI(parsedURL.pathname);
    } catch (e) {
        filePath = parsedURL.pathname;
    }

    filePath = path.join(host.replace(':', '_'), filePath);

    return sanitizeFilepath(`${filePath}/index.html`);
}

function saveHTMLToDisk(link, outputDirectory, content) {
    return new Promise((resolve, reject) => {
        const filename = generateFilename(link);
        fs.outputFile(`${outputDirectory}/${filename}`, content, err => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    })
}

async function getScraper({
    outputDirectory = "out/",
    maxPages
} = {}) {
    let browser = await puppeteer.launch();
    let pageOpener = getPageOpener({
        browser,
        maxPages
    });

    async function scrape(page, url) {
        try {
            await page.goto(url);
            console.log(`${url}: Opened page`);

            await inlineStylesInPage(page);
            console.log(`${url}: Inlined styles`);

            const content = await page.content();
            console.log(`${url}: Extracted content`);

            await saveHTMLToDisk(url, outputDirectory, content);
            console.log(`${url}: Saved`);
            await pageOpener.close(page);
        } catch (err) {
            console.error(err);
            await pageOpener.close(page);
        }
    }

    return async function scraper(urls) {
        for (let url of urls) {
            if (!browser) {
                browser = await puppeteer.launch();
                pageOpener = getPageOpener({
                    browser,
                    maxPages
                });
            }
            const page = await pageOpener.open();
            scrape(page, url);
        }
    }
}

getScraper({
    outputDirectory: "out/",
    maxPages: 20
}).then(scraper => {
    scraper(entries.slice(8200).map(entry => `http://${entry}`));
});
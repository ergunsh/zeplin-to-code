const puppeteer = require("puppeteer");
const { Semaphore } = require("await-semaphore");
const fs = require("fs-extra");
const url = require("url");
const path = require("path");
const urls = require("./entries").filter((value, index, self) => self.indexOf(value) == index);
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

function getPageOpener({
    browser,
    maxPages = 5
} = {}) {
    const semaphore = new Semaphore(maxPages);
    return {
        open: async () => {
            const release = await semaphore.acquire();
            const page = await browser.newPage();
            page.release = release;
            return page;
        },
        close: async page => {
            await page.close();
            page.release();
        }
    }
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
    recursionDepth = 1,
    maxPages = 3
} = {}) {
    const browser = await puppeteer.launch();
    const pageOpener = getPageOpener({
        browser,
        maxPages
    });
    const queuedPages = new Map();
    async function scrape(url, currentDepth = 0) {
        queuedPages.set(url, true);

        if (currentDepth > recursionDepth) {
            // console.log(`Bailing out before scraping ${url} because it is too deep at ${currentDepth}`)
            return;
        }

        console.log(`${url}: Queued`);
        try {
            const page = await pageOpener.open();
            await page.goto(url);
            console.log(`${url}: Opened page`);

            const links = await getLinksInPage(page);
            links.forEach(link => {
                if (queuedPages.has(link)) {
                    return;
                }

                scrape(link, currentDepth + 1)
            });

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

    return function scraper(urls) {
        urls.forEach(scrape);
    }
}

getScraper({
    outputDirectory: "out/",
    recursionDepth: 0
}).then(scraper => {
    scraper(["https://zeplin.io"]);
});
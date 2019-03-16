const scrape = require("website-scraper");
const puppeteer = require("puppeteer");
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

class PuppeteerPlugin {
    apply(registerAction) {
		let browser;

		registerAction("beforeStart", async () => {
			browser = await puppeteer.launch();
		});

		registerAction("afterResponse", async ({response}) => {
			const contentType = response.headers["content-type"];
			const isHtml = contentType && contentType.split(";")[0] === "text/html";
			if (isHtml) {
                const url = response.request.href;
				const page = await browser.newPage();
                await page.goto(url);
                await page.evaluate(inlineStyleFnText => {
                    const inlineStyleInPage = new Function(`return (${inlineStyleFnText}).apply(null, arguments)`);
                    inlineStyleInPage(document.body, {
                        recursive: true
                    });
                }, inlineStyle.toString());

                const content = await page.content();
                await page.close();

                return content;
			} else {
				return null; // Don't save anything other than html
			}
		});

		registerAction("afterFinish", () => browser.close());
	}
}

scrape({
    urls,
    directory: "./out/",
    sources: [],
    filenameGenerator: "bySiteStructure",
    request: {
        maxRedirects: 4,
        timeout: 5000
    },
    recursive: true,
    maxRecursiveDepth: 2,
    plugins: [ new PuppeteerPlugin() ]
}).then(() => {
    console.log("scraped");
});

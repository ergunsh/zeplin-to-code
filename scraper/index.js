const scrape = require("website-scraper");
const urls = require("./entries").filter((value, index, self) => self.indexOf(value) == index);
console.log("urls", urls);
class ErrorLoggerPlugin {
    apply(registerAction) {
        registerAction('onResourceError', ({resource, error}) => {
            console.log("error-start");
            console.log(`errored: ${resource.getUrl()}`);
            console.log(error);
            console.log("error-finish");
        });
    }
}

scrape({
    urls,
    directory: "./out/",
    sources: [{ selector: 'link[rel="stylesheet"]', attr: "href" }],
    filenameGenerator: "bySiteStructure",
    request: {
        maxRedirects: 4,
        timeout: 5000
    },
    recursive: true,
    maxRecursiveDepth: 2,
    plugins: [ new ErrorLoggerPlugin() ]
}).then(() => {
    console.log("scraped");
});

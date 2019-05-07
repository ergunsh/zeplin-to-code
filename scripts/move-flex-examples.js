const path = require("path");
const fs = require("fs-extra");
const find = require("find");
const { Semaphore } = require("await-semaphore");

const relativePath = process.argv[2];
const datasetPath = path.resolve(__dirname, relativePath);
const fileOpenSemaphore = new Semaphore(50);

function findFile(file, location) {
    return new Promise(resolve => {
        find.file(file, location, resolve);
    });
}

async function checkIsFlexExample(file) {
    try {
        const fileContent = await fs.readJSON(file);
        return fileContent.y.includes(".flex");
    } catch (err) {
        // print err
        console.error(err);
        return false;
    }
}

let numberOfFlexExamples = 0;
async function removeAllZeroInputs(datasetDir) {
    const files = await findFile(/.*\.json$/, datasetDir);
    files.forEach(async file => {
        const release = await fileOpenSemaphore.acquire();
        try {
            const isFlexExample = await checkIsFlexExample(file);
            if (isFlexExample) {
                numberOfFlexExamples++;
                await fs.copy(file, "../compiler/flex-examples/data-flex-" + numberOfFlexExamples + ".json");
                console.log("flex example", file);
                console.log("numberOfFlexExamples", numberOfFlexExamples);
            }
            release();
        } catch (e) {
            console.error(e);
            release();
        }
    });
}

removeAllZeroInputs(datasetPath).then(() => {
    console.log("Number of flex examples", numberOfFlexExamples);
});

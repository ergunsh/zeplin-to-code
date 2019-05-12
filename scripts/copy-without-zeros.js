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

async function getContentWithoutZeroX(file) {
    const fileContent = await fs.readJSON(file);
    try {
        const newContent = Object.assign({}, fileContent, { x: fileContent.x.filter(x => {
            return !(x.x === 0 && x.y === 0 && x.width === 0 && x.height === 0)
        })});

        return newContent;
    } catch (err) {
        // print err
        console.error(err);
        return fileContent;
    }
}

async function removeAllZeroInputs(datasetDir) {
    const files = await findFile(/.*\.json$/, datasetDir);
    files.forEach(async (file, i) => {
        const release = await fileOpenSemaphore.acquire();
        try {
            console.log("file", file);
            const contentWithoutZeros = await getContentWithoutZeroX(file);
            await fs.writeJSON(`../compiler/out-without-text-nodes/data-${i}.json`, contentWithoutZeros);
            release();
        } catch (e) {
            console.error(e);
            release();
        }
    });
}

removeAllZeroInputs(datasetPath);

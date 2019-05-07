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

async function checkShouldRemoveFile(file) {
    try {
        const fileContent = await fs.readJSON(file);
        if (fileContent.viewport.width === 0 || fileContent.viewport.height === 0) {
            return true;
        }

        return fileContent.x.every(x => (
            x.x === 0 && x.y === 0 && x.width === 0 && x.height === 0
        ));
    } catch (err) {
        // print err
        console.error(err);
        return true;
    }

}

async function removeAllZeroInputs(datasetDir) {
    const files = await findFile(/.*\.json$/, datasetDir);
    files.forEach(async file => {
        const release = await fileOpenSemaphore.acquire();
        try {
            const shouldRemoveFile = await checkShouldRemoveFile(file);
            if (shouldRemoveFile) {
                await fs.remove(file, () => {
                    console.log("removed", file);
                });
            }
            release();
        } catch (e) {
            console.error(e);
            release();
        }
    });
}

removeAllZeroInputs(datasetPath);

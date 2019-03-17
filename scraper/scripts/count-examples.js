const find = require("find");
const fs = require("fs-extra");
const { Semaphore } = require("await-semaphore");
const chalk = require("chalk");
const examplesDir = "dataset/";

const semaphore = new Semaphore(100);
let count = 0;
function findFile(file, location) {
    return new Promise(resolve => {
        find.file(file, location, resolve);
    });
}

function countOutputsInFile(file) {
    let releaseInBlock;
    return semaphore.acquire().then(release => {
        releaseInBlock = release;
        return fs.readFile(file, { encoding: "utf8" });
    }).then(content => {
        const json = JSON.parse(content);
        releaseInBlock();
        count += json.outputs.length;
        process.stdout.write(`\r\x1b[?25l${chalk.bold(count)}`);
    }).catch(err => {
        console.error(err);
        releaseInBlock();
    });
}

findFile(/.*\.json$/, examplesDir)
    .then(files => {
        return Promise.all(files.map(countOutputsInFile));
    })
    .then(() => {
        console.log("");
    })
    .catch(err => {
        console.error(err);
    })
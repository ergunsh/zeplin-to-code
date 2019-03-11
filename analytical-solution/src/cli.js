// CLI entry for the tool
const fs = require("fs");
const generateCode = require("./index");

function main() {
    const [,,input] = process.argv;
    if (!input) {
        throw new Error("Input file is not specified");
    }

    const fileContent = fs.readFileSync(input);
    const dataObj = JSON.parse(fileContent);

    const code = generateCode(dataObj);
    console.log(code);
}

main();
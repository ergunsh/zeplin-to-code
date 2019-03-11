// Tool itself
const { stripIndent } = require("common-tags");

/**
 *
 * Takes a Zeplin screen or component and returns React Native code.
 *
 * @param {Object} data
 */
function generateCode(data) {
    console.log("Data:", data);
    console.log(stripIndent`
        ==============
        === Output ===
    `);
    return stripIndent`
        <View>
            <Text>Deneme</Text>
        </View>
    `;
}

module.exports = generateCode;
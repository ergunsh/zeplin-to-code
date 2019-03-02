const { stripIndent } = require("common-tags");
const util = require("util");

const DIRECTION_ROW = "row";
const DIRECTION_COLUMN = "column";

/**
 * Takes a parent Zeplin layer and returns its flex direction property if it has a proper direction.
 * Throws otherwise.
 *
 * @param {Object} layer - Zeplin layer
 */
function generateFlexDirection(layer) {
    const { layers: children } = layer;
    if (!children) {
        throw new Error("Children does not exist on layer");
    }

    if (children.length === 1) {
        return DIRECTION_COLUMN;
    }

    let direction;
    for (const i = 0; i < children.length - 1; i++) {
        const formerChild = children[i];
        const latterChild = children[i + 1];
        const xDifference = latterChild.rect.x - formerChild.rect.x;
        const yDifference = latterChild.rect.y - formerChild.rect.y;
        if (xDifference === 0 && yDifference >= formerChild.rect.height) {
            if (direction === DIRECTION_ROW) {
                throw new Error("Found DIRECTION_ROW but calculated DIRECTION_COLUMN");
            }

            direction = DIRECTION_COLUMN;
            break;
        }

        if (yDifference === 0 && xDifference >= formerChild.rect.width) {
            if (direction === DIRECTION_COLUMN) {
                throw new Error("Found DIRECTION_COLUMN but calculated DIRECTION_ROW");
            }

            direction = DIRECTION_ROW;
            break;
        }

        throw new Error(stripIndent`
            The "${formerChild.name}" and "${latterChild.name}" cannot be laid of in flex
            ---
            ${util.inspect(formerChild.rect, { colors: true })}
            ${util.inspect(latterChild.rect, { colors: true })}
        `);
    }

    return direction;
}

module.exports = {
    generateFlexDirection,
    DIRECTION_ROW,
    DIRECTION_COLUMN
};
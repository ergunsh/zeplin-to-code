const tokens = require("./tokens");

const mapping = {
    display: {
        block: tokens.BLOCK,
        flex: tokens.FLEX,
        inline: tokens.INLINE,
        "inline-block": tokens.INLINE_BLOCK,
        table: tokens.TABLE,
    },
    position: {
        static: tokens.STATIC,
        relative: tokens.RELATIVE,
        fixed: tokens.FIXED,
        absolute: tokens.ABSOLUTE,
        sticky: tokens.STICKY
    },
    "flex-direction": {
        row: tokens.ROW,
        column: tokens.COLUMN
    },
    "flex-wrap": {
        wrap: tokens.WRAP,
        nowrap: tokens.NOWRAP
    },
    "justify-content": {
        "flex-start": tokens.J_FLEX_START,
        "flex-end": tokens.J_FLEX_END,
        center: tokens.J_CENTER,
        "space-between": tokens.J_SPACE_BETWEEN,
        "space-around": tokens.J_SPACE_AROUND,
        "space-evenly": tokens.J_SPACE_EVENLY
    },
    "align-items": {
        "flex-start": tokens.AI_FLEX_START,
        "flex-end": tokens.AI_FLEX_END,
        center: tokens.AI_CENTER,
        strecth: tokens.AI_STRETCH,
        baseline: tokens.AI_BASELINE
    }
};

module.exports = mapping;

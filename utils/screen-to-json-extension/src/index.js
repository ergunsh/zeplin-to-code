const stringify = require("fast-safe-stringify");

function layer(context, selectedLayer) {

}

function screen(context, selectedVersion, selectedScreen) {
    console.log("context", context);
    console.log("selectedVersion", stringify(selectedVersion.layers));
    console.log("selectedScreen", selectedScreen);
}

function component(context, selectedVersion, selectedComponent) {

}

function styleguideColors(context, colors) {

}

function styleguideTextStyles(context, textStyles) {

}

function exportStyleguideColors(context, colors) {

}

function exportStyleguideTextStyles(context, textStyles) {

}

function comment(context, text) {

}

export default {
    layer,
    screen,
    component,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};

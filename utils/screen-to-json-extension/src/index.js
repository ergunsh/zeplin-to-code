const circularStringify = function circularJSONStringify(obj) {
    const cache = [];
    const result = JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache.length = 0;
    return result;
};

function screen(context, selectedVersion, selectedScreen) {
    console.log("context", context);
    console.log("selectedVersion", circularStringify(selectedVersion.layers));
    console.log("selectedScreen", selectedScreen);
}

export default {
    screen
};

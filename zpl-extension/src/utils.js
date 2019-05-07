const words = require("./tokens");

function get_number_of_words() {
    return words.length;
}

function convert_word_to_vector(word) {
    const index = words.indexOf(word)
    const vec = Array(words.length).fill(0);
    vec[index] = 1
    return vec
}

function convert_index_to_word(index) {
    return words[index];
}

function convert_vector_to_word(vec) {
    const indexOfOne = vec.indexOf(1);
    return words[indexOfOne];
}

function arg_index_max(arr) {
    const { index } = arr.reduce((current, elValue, elIndex) => {
        const { value } = current;
        if (elValue > value) {
            return {
                index: elIndex,
                value: elValue
            }
        }

        return current;
    }, { value: arr[0], index: 0 });

    return index;
}

module.exports = {
    get_number_of_words,
    arg_index_max,
    convert_word_to_vector,
    convert_index_to_word,
    convert_vector_to_word
};
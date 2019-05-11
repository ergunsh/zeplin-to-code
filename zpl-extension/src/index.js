import * as tf from "@tensorflow/tfjs";
import * as utils from "./utils";
import dslToRN from "../../compiler/dsl-to-rn";

const max_decoder_seq_length = 10000;
const depth = 2;
let sampleFn;
tf.loadLayersModel("http://localhost:7070/best-of-three-model/model.json").then(model => {
    const { encoder_model, decoder_model } = assemblyModel(model);
    sampleFn = get_sampler({
        encoder_model,
        decoder_model
    });
});

function get_sampler({
    encoder_model,
    decoder_model
}) {
    return function sample_from_sampler(input_seq_arr) {
        let input_seq = tf.tensor(input_seq_arr);
        let states_value = encoder_model.predict(input_seq);
        const target_seq_arr = [[utils.convert_word_to_vector(".start")]]
        let target_seq = tf.tensor3d(target_seq_arr);

        let stop_condition = false;
        let decoded_sentence = "";
        while (!stop_condition) {
            const decoder_input = [target_seq, ...states_value];
            const [output_tokens, h, c] = decoder_model.predict(decoder_input)

            const output_tokens_arr = output_tokens.arraySync();
            const last_token_arr = output_tokens_arr[0][output_tokens_arr.length - 1];

            const sampled_token_index = utils.arg_index_max(last_token_arr);
            const sampled_token = utils.convert_index_to_word(sampled_token_index)
            decoded_sentence += sampled_token

            if (sampled_token == '.stop' || decoded_sentence.length > max_decoder_seq_length) {
                stop_condition = true;
            }

            const target_arr = target_seq.arraySync();
            target_arr[0][0] = utils.convert_word_to_vector(sampled_token);
            target_seq = tf.tensor3d(target_arr);
            states_value = [h, c];
        }

        return decoded_sentence
    }
}

function collect_rects(layers, currentDepth = 0) {
    let rects = [];
    if (depth <= currentDepth) {
        return [];
    }

    for (let layer of layers) {
        rects.push(layer.rect);
        if (layer.layers && layer.layers.length) {
            const childRects = collect_rects(layer.layers, currentDepth + 1);
            rects = rects.concat(childRects);
        }
    }
    return rects;
}

function get_input_from_rect(rect, imageWidth, imageHeight) {
    return [
        rect.x / imageWidth,
        rect.y / imageHeight,
        rect.width / imageWidth,
        rect.height / imageHeight
    ];
}

function get_input_arr_from_version(version) {
    const { image: { width, height }, layers } = version;
    const rects = collect_rects(layers).sort((r1, r2) => {
        const yDiff = r1.y - r2.y
        const xDiff = r1.x - r2.x;
        return yDiff !== 0 ? yDiff : xDiff;
    });
    console.log("rects", rects);
    const input = rects.map(rect => get_input_from_rect(rect, width, height));
    console.log("input", input);
    return [input];
}

function assemblyModel(model) {
    const latent_dim = 128;
    const encoder_inputs = model.input[0];
    const [_, state_h_enc, state_c_enc] = model.layers[2].output;
    const encoder_states = [state_h_enc, state_c_enc];

    const encoder_model = tf.model({
        inputs: encoder_inputs,
        outputs: encoder_states
    });

    const decoder_inputs = model.input[1];
    const decoder_state_input_h = tf.layers.input({ shape: [latent_dim], name: "input_3" });
    const decoder_state_input_c = tf.layers.input({ shape: [latent_dim], name: "input_4" });
    const decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c];

    const decoder_lstm = model.layers[3];
    let [decoder_outputs, state_h_dec, state_c_dec] = decoder_lstm.apply(decoder_inputs, {
        initialState: decoder_states_inputs
    });
    const decoder_states = [state_h_dec, state_c_dec];

    const decoder_dense = model.layers[4];
    decoder_outputs = decoder_dense.apply(decoder_outputs);
    const decoder_model = tf.model({
        inputs: [decoder_inputs, ...decoder_states_inputs],
        outputs: [decoder_outputs, ...decoder_states]
    });

    return {
        encoder_model,
        decoder_model
    };
}

function layer(context, selectedLayer) {}

function screen(context, selectedVersion, selectedScreen) {
    if (!sampleFn) {
        return {
            code: `{ "error": "Model is not initialized yet" }`,
            language: "json"
        };
    }

    const input_arr_from_version = get_input_arr_from_version(selectedVersion);
    const decoded_sentence = sampleFn(input_arr_from_version);
    console.log("decoded_sentence", decoded_sentence);
    return {
        code: dslToRN(decoded_sentence),
        language: "jsx"
    };
}

function component(context, selectedVersion, selectedComponent) {
    if (!sampleFn) {
        return {
            code: `{ "error": "Model is not initialized yet" }`,
            language: "json"
        };
    }

    const input_arr_from_version = get_input_arr_from_version(selectedVersion);
    const decoded_sentence = sampleFn(input_arr_from_version);
    console.log("decoded_sentence", decoded_sentence);
    return {
        code: dslToRN(decoded_sentence),
        language: "jsx"
    };
}

function styleguideColors(context, colors) {}

function styleguideTextStyles(context, textStyles) {}

function exportStyleguideColors(context, colors) {}

function exportStyleguideTextStyles(context, textStyles) {}

function comment(context, text) {}

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

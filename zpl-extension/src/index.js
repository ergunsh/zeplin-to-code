import * as tf from "@tensorflow/tfjs";
import * as utils from "./utils";

const max_decoder_seq_length = 10000;
tf.loadLayersModel("http://localhost:7070/js-model/model.json").then(model => {
    const { encoder_model, decoder_model } = assemblyModel(model);
    const input_arr = [[[0, 0, 1, 1], [0, 0, 0.5, 0.5]]];
    const input_seq = tf.tensor(input_arr);
    sample(input_seq, {
        encoder_model,
        decoder_model
    });
});

function sample(input_seq, {
    encoder_model,
    decoder_model
}) {
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
        console.log("sampled_token", sampled_token);
        const target_arr = target_seq.arraySync();
        target_arr[0][0] = utils.convert_word_to_vector(sampled_token);
        target_seq = tf.tensor3d(target_arr);
        states_value = [h, c];
    }

    return decoded_sentence
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

function screen(context, selectedVersion, selectedScreen) {}

function component(context, selectedVersion, selectedComponent) {}

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

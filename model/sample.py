import numpy as np
import utils

from keras import models, layers
from dataset import DatasetGenerator

data_generator = DatasetGenerator(dir_path="../compiler/out-new", batch_size=1)
latent_dim = 128
max_decoder_seq_length = 100000

number_of_words = utils.get_number_of_words()
model = models.load_model("s2s.flex")

encoder_inputs = model.input[0]   # input_1
encoder_outputs, state_h_enc, state_c_enc = model.layers[2].output   # lstm_1
encoder_states = [state_h_enc, state_c_enc]
encoder_model = models.Model(encoder_inputs, encoder_states)

decoder_inputs = model.input[1]   # input_2
decoder_state_input_h = layers.Input(shape=(latent_dim,), name='input_3')
decoder_state_input_c = layers.Input(shape=(latent_dim,), name='input_4')
decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]

decoder_lstm = model.layers[3]
decoder_outputs, state_h_dec, state_c_dec = decoder_lstm(
    decoder_inputs, initial_state=decoder_states_inputs)
decoder_states = [state_h_dec, state_c_dec]
decoder_dense = model.layers[4]
decoder_outputs = decoder_dense(decoder_outputs)
decoder_model = models.Model(
    [decoder_inputs] + decoder_states_inputs,
    [decoder_outputs] + decoder_states)

def sample(input_seq):
    # Encode the input as state vectors.
    states_value = encoder_model.predict(input_seq)
     # Generate empty target sequence of length 1.
    target_seq = np.zeros((1, 1, number_of_words))
    # Populate the first character of target sequence with the start character.
    target_seq[0, 0] = utils.convert_word_to_vector(".start")
    stop_condition = False
    decoded_sentence = ""
    while not stop_condition:
        output_tokens, h, c = decoder_model.predict([target_seq] + states_value)
        # Sample a token
        sampled_token_index = np.argmax(output_tokens[0, -1, :])
        sampled_token = utils.convert_index_to_word(sampled_token_index)
        decoded_sentence += sampled_token

        # Exit condition: either hit max length
        # or find stop character.
        if (sampled_token == '.stop' or
           len(decoded_sentence) > max_decoder_seq_length):
            stop_condition = True

        # Update the target sequence (of length 1).
        target_seq = np.zeros((1, 1, number_of_words))
        target_seq[0, 0] = output_tokens[0, -1];
        # target_seq[0].append(output_tokens[0, -1])

        # Update states
        states_value = [h, c]

    return decoded_sentence

def run_sampling():
    for seq_index in range(100, 150):
        [X, decoderX], y = data_generator[seq_index]
        decoded_sentence = sample(X)
        print('-')
        print('Input sentence:', X)
        print('Decoded sentence:', decoded_sentence)
run_sampling()
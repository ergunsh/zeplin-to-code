import numpy as np
import utils

from keras import models, layers
from dataset import DatasetGenerator

data_generator = DatasetGenerator(dir_path="../compiler/out-new", batch_size=1)
number_of_words = utils.get_number_of_words()
latent_dim = 128

# Training

# Define an input sequence and process it.
encoder_inputs = layers.Input(shape=(None, 4))
encoder = layers.LSTM(latent_dim, input_shape=(None, 4), return_state=True)

encoders_outputs, state_h, state_c = encoder(encoder_inputs)
# We discard `encoder_outputs` and only keep the states.
encoder_states = [state_h, state_c]

# Set up the decoder, using `encoder_states` as initial state.
decoder_inputs = layers.Input(shape=(None, number_of_words))

# We set up our decoder to return full output sequences,
# and to return internal states as well. We don't use the
# return states in the training model, but we will use them in sampling.
decoder_lstm = layers.LSTM(latent_dim, return_sequences=True, return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_inputs, initial_state=encoder_states)

decoder_dense = layers.Dense(number_of_words, activation="softmax")
decoder_outputs = decoder_dense(decoder_outputs)

# Define the model that will turn
# `encoder_input_data` & `decoder_input_data` into `decoder_target_data`
model = models.Model([encoder_inputs, decoder_inputs], decoder_outputs)

# Run training
model.compile(optimizer="rmsprop", loss="categorical_crossentropy")
model.summary()
history = model.fit_generator(generator=data_generator)
model.save("s2s.second")
print(history)
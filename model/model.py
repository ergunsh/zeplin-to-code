import numpy as np
import utils

from keras import models, layers
from dataset import DatasetGenerator

data_generator = DatasetGenerator(dir_path="../compiler/out-with-position", batch_size=1)
number_of_words = utils.get_number_of_words()

encoder_inputs = layers.Input(shape=(None, 4))
encoder = layers.LSTM(128, input_shape=(None, 4), return_state=True)

encoders_outputs, state_h, state_c = encoder(encoder_inputs)
encoder_states = [state_h, state_c]

decoder_inputs = layers.Input(shape=(None, number_of_words))
decoder_lstm = layers.LSTM(128, return_sequences=True, return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_inputs, initial_state=encoder_states)

decoder_dense = layers.Dense(number_of_words, activation="softmax")
decoder_outputs = decoder_dense(decoder_outputs)

model = models.Model([encoder_inputs, decoder_inputs], decoder_outputs)
model.compile(optimizer="rmsprop", loss="categorical_crossentropy")
model.summary()
history = model.fit_generator(generator=data_generator)
model.save("s2s.initial")
print(history)
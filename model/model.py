import numpy as np
import utils
import json
import os
import tensorflow as tf

from keras import models, layers, metrics, callbacks, backend
from dataset import DatasetGenerator


config = tf.ConfigProto(intra_op_parallelism_threads=6,
    inter_op_parallelism_threads=2,
    allow_soft_placement=True,
    device_count = {'CPU': 6 })

session = tf.Session(config=config)
backend.set_session(session)

os.environ["OMP_NUM_THREADS"] = "6"
os.environ["KMP_BLOCKTIME"] = "30"
os.environ["KMP_SETTINGS"] = "1"
os.environ["KMP_AFFINITY"]= "granularity=fine,verbose,compact,1,0"

data_generator = DatasetGenerator(dir_path="../compiler/out-without-text-nodes", batch_size=1)
validation_generator = DatasetGenerator(dir_path="../compiler/out-validation", batch_size=1)

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

weigth_file="./weights/weights-improvement-long-{epoch:02d}-{categorical_accuracy:.4f}.hdf5"
checkpoint_callback = callbacks.ModelCheckpoint(weigth_file, monitor='categorical_accuracy', verbose=1, save_best_only=True, mode='max')

class CustomCheckpoint(callbacks.Callback):
    def __init__(self):
        self.current_batch_number = 0

    def on_batch_end(self, batch, logs=None):
        self.current_batch_number = self.current_batch_number + 1
        if self.current_batch_number % 100 == 0: # Save at every 100 data
            save_path = "./weights/last-model-" + str(self.current_batch_number) + ".hdf5"
            self.model.save(save_path)

custom_checkpoint = CustomCheckpoint()
# Run training
model.compile(optimizer="rmsprop",
    loss="categorical_crossentropy",
    metrics=["categorical_accuracy"])
model.summary()
history = model.fit_generator(generator=data_generator,
    epochs=5,
    use_multiprocessing=True,
    callbacks=[checkpoint_callback, custom_checkpoint],
    validation_data=validation_generator)
model.save("s2s.without-text-nodes")
with open("history.json", "w+") as f:
    json.dump(history.history, f)
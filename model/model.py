import numpy as np

from keras.models import Sequential
from keras.layers import Dense
from dataset import DatasetGenerator

data_generator = DatasetGenerator(dir_path="../compiler/out-with-position")
print(data_generator.max_len)
model = Sequential()
model.add(Dense(32, input_shape=(32, 4, data_generator.max_len)))
model.compile(optimizer="sgd", loss="mean_squared_error")

history = model.fit_generator(generator=data_generator)
print(history)
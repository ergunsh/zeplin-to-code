import numpy as np
import keras
import json
import utils
from os import listdir, path

def convert_x_dict_to_list(x_dict, viewport):
    return np.array([
        float(x_dict["x"]) / viewport["width"],
        float(x_dict["y"]) / viewport["height"],
        float(x_dict["width"]) / viewport["width"],
        float(x_dict["height"]) / viewport["height"]
    ])

def convert_y_to_word_vectors(y):
    tokensSplit = y.split(".")
    vectors = map(lambda tokenWithoutDot: utils.convert_word_to_vector("." + tokenWithoutDot), tokensSplit[1:])
    return vectors

def generate_data_for_file(file_path, max_len):
    with open(file_path) as json_file:
        data = json.load(json_file)
        list_x = np.array(map(lambda rect: convert_x_dict_to_list(rect, data["viewport"]), data["x"]))
        padded_x = keras.preprocessing.sequence.pad_sequences(data["x"], maxlen=max_len, dtype=object, value=np.zeros(4))
        y = convert_y_to_word_vectors(data["y"]).append(utils.convert_word_to_vector(".stop"))
        return padded_x, y

def get_max_length_input(data_files, dir_path):
    max_len = 0
    for data_file in data_files:
        with open(path.join(dir_path, data_file)) as json_file:
            data = json.load(json_file)
            x_len = len(data["x"])
            if x_len > max_len:
                max_len = x_len
    return max_len

class DatasetGenerator(keras.utils.Sequence):
    def __init__(self, dir_path, batch_size=32):
        self.batch_size = batch_size
        self.dir_path = dir_path
        self.data_files = listdir(dir_path)
        self.max_len = get_max_length_input(self.data_files, dir_path)

    def __len__(self):
        "Denotes the number of batches per epoch"
        return int(np.floor(len(self.data_files)) / self.batch_size)

    def __getitem__(self, index):
        files = self.data_files[index * self.batch_size: (index + 1) * self.batch_size]
        return self.__generate_data(files)

    def __generate_data(self, files):
        return map(lambda file_name: generate_data_for_file(path.join(self.dir_path, file_name), self.max_len), files)
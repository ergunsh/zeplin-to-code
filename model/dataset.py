import numpy as np
import keras
import json
import utils
from os import listdir, path

def convert_x_dict_to_list(x_dict, viewport):
    return [
        float(x_dict["x"]) / viewport["width"],
        float(x_dict["y"]) / viewport["height"],
        float(x_dict["width"]) / viewport["width"],
        float(x_dict["height"]) / viewport["height"]
    ]

def advance_token(y):
    pass

def convert_y_to_word_vectors(y):
    return y

def generate_data_for_file(file_path):
    with open(file_path) as json_file:
        data = json.load(json_file)
        x_list = map(lambda rect: convert_x_dict_to_list(rect, data["viewport"]), data["x"])
        y = convert_y_to_word_vectors(data["y"])
        return x_list, y

class DatasetGenerator(keras.utils.Sequence):
    def __init__(self, dir_path, batch_size=32):
        self.batch_size = batch_size
        self.dir_path = dir_path
        self.data_files = listdir(dir_path)

    def __len__(self):
        "Denotes the number of batches per epoch"
        return int(np.floor(len(self.data_files)) / self.batch_size)

    def __getitem__(self, index):
        files = self.data_files[index * self.batch_size: (index + 1) * self.batch_size]
        X, y = self.__generate_data(files)

    def __generate_data(self, files):
        x, y = generate_data_for_file(path.join(self.dir_path, files[0]))
        return "a", "b"

generator = DatasetGenerator(dir_path="../compiler/out")
print(generator.__getitem__(0))
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

def generate_data_for_file(file_path):
    Xs = []
    decoderXs = []
    Ys = []
    with open(file_path) as json_file:
        data = json.load(json_file)
        list_x = np.array(map(lambda rect: convert_x_dict_to_list(rect, data["viewport"]), data["x"]))
        y = convert_y_to_word_vectors(data["y"])
        y.insert(0, utils.convert_word_to_vector(".start"))
        decoderX = []
        decoderY = []
        for t, word_vector in enumerate(y):
            decoderX.append(word_vector)
            if t > 0:
                decoderY.append(word_vector)
        decoderY.append(utils.convert_word_to_vector(".stop"))
        return list_x, decoderX, decoderY

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
        X, decoderX, y = self.__generate_data(files)
        return [X, decoderX], y

    def __generate_data(self, files):
        Xs = []
        decoderXs = []
        ys = []
        for file_name in files:
            X, decoderX, y = generate_data_for_file(path.join(self.dir_path, file_name))
            Xs.append(X)
            decoderXs.append(decoderX)
            ys.append(y)
        return np.array(Xs), np.array(decoderXs), np.array(ys)
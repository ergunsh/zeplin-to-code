import numpy as np
import json

global words, word_mapping

with open("./words.json") as words_file:
    words = json.load(words_file)

def get_number_of_words():
    return len(words)

def convert_word_to_vector(word):
    index = words.index(word)
    vec = np.zeros(len(words))
    vec[index] = 1
    return vec

def convert_vector_to_word(vec):
    return words[np.nonzero(vec)[0][0]]

def get_word_mapping():
    mapping = {}
    for word in words:
        mapping[word] = convert_word_to_vector(word)
    return mapping
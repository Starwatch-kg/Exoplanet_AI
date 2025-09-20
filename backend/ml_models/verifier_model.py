import tensorflow as tf
from tensorflow.keras import layers
import numpy as np

class VerifierModel(tf.keras.Model):
    def __init__(self, input_shape):
        super().__init__()

        # Получаем длину входных данных
        input_length = input_shape[0]

        # Делаем архитектуру адаптивной к длине входных данных
        if input_length >= 16:  # Достаточно данных для полной архитектуры
            self.conv1 = layers.Conv1D(32, 5, activation='relu', input_shape=input_shape)
            self.pool1 = layers.MaxPooling1D(2)
            self.conv2 = layers.Conv1D(64, 5, activation='relu')
            self.pool2 = layers.MaxPooling1D(2)
            self.lstm = layers.LSTM(64)
            self.dense1 = layers.Dense(128, activation='relu')
            self.output_layer = layers.Dense(1, activation='sigmoid')
        elif input_length >= 8:  # Достаточно данных для упрощенной архитектуры
            self.conv1 = layers.Conv1D(32, 3, activation='relu', input_shape=input_shape)
            self.pool1 = layers.MaxPooling1D(2)
            self.conv2 = layers.Conv1D(64, 3, activation='relu')
            self.lstm = layers.LSTM(32)
            self.dense1 = layers.Dense(64, activation='relu')
            self.output_layer = layers.Dense(1, activation='sigmoid')
        elif input_length >= 4:  # Очень мало данных - только один слой
            self.conv1 = layers.Conv1D(16, 2, activation='relu', input_shape=input_shape)
            self.lstm = layers.LSTM(16)
            self.dense1 = layers.Dense(32, activation='relu')
            self.output_layer = layers.Dense(1, activation='sigmoid')
        else:  # Минимальная архитектура для очень коротких последовательностей
            self.dense1 = layers.Dense(16, activation='relu', input_shape=input_shape)
            self.output_layer = layers.Dense(1, activation='sigmoid')

    def call(self, inputs):
        x = inputs

        # Применяем слои только если они определены
        if hasattr(self, 'conv1'):
            x = self.conv1(x)
            if hasattr(self, 'pool1'):
                x = self.pool1(x)

        if hasattr(self, 'conv2'):
            x = self.conv2(x)
            if hasattr(self, 'pool2'):
                x = self.pool2(x)

        x = self.lstm(x) if hasattr(self, 'lstm') else x
        x = self.dense1(x)
        return self.output_layer(x)

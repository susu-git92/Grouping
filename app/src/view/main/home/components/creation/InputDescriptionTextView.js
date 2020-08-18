import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { WINDOW_SIZE } from '../../../../../constant/WindowSize';

const InputDescriptionTextView = (props) => {
  return (
    <View style={styles.titleContainer}>
      <TextInput
        style={styles.title}
        maxLength={1000}
        placeholder={props.textExample}
        autoCorrect={false}
        multiline
        numberOfLines={5}
        placeholderTextColor="#ddd"
        value={props.value}
        onChangeText={props.onChangeText != null ? (text) => props.onChangeText(text) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    borderColor: 'black',
    borderBottomWidth: 1 * WINDOW_SIZE.WIDTH_WEIGHT,
    flexDirection: 'row',
    width: '90%',
    margin: 10 * WINDOW_SIZE.WIDTH_WEIGHT,
  },

  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10 * WINDOW_SIZE.WIDTH_WEIGHT,
    marginLeft: 10 * WINDOW_SIZE.WIDTH_WEIGHT,
    marginBottom: 10 * WINDOW_SIZE.HEIGHT_WEIGHT,
    color: Colors.black,
    fontSize: 15 * WINDOW_SIZE.WIDTH_WEIGHT,
  },

  counter: {
    color: 'black',
  },
});

export default InputDescriptionTextView;

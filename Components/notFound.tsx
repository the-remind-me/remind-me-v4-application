import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const Holiday = ({ name }: { name: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>It's a holiday!</Text>
    <Text style={styles.subText}>{name}</Text>
    <Text style={styles.subText}>Enjoy your day off!</Text>
  </View>
);

export const NoClassToday = () => (
  <View style={styles.container}>
    <Text style={styles.text}>No classes today</Text>
    <Text style={styles.subText}>Enjoy your free time!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

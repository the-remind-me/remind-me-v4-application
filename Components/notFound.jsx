import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const NoScheduleFound = () => (
  <View style={styles.container}>
    <Text style={styles.text}>No schedule found</Text>
    <Text style={styles.subText}>Please check your connection or try again later</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

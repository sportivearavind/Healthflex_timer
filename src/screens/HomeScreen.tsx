import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [timerName, setTimerName] = useState('');
  const [duration, setDuration] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHalfwayAlert, setShowHalfwayAlert] = useState(false);

  const startTimer = () => {
    if (!timerName || !duration) {
      Alert.alert('Error', 'Please enter timer name and duration');
      return;
    }

    const durationInSeconds = parseInt(duration) * 60;
    setTimeLeft(durationInSeconds);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    // Save to history
    saveToHistory();
  };

  const saveToHistory = async () => {
    try {
      const historyItem = {
        name: timerName,
        completionTime: new Date().toISOString(),
        duration: duration,
      };

      const existingHistory = await AsyncStorage.getItem('timerHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(historyItem); // Add new item at the beginning
      
      await AsyncStorage.setItem('timerHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Check for halfway point
          if (newTime === parseInt(duration) * 30 && showHalfwayAlert) {
            Alert.alert('Halfway Point', 'You\'ve reached the halfway point!');
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      Alert.alert('Timer Complete', 'Your timer has finished!');
      saveToHistory();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, showHalfwayAlert]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Timer Name"
        value={timerName}
        onChangeText={setTimerName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Duration (minutes)"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <View style={styles.alertContainer}>
        <Text>Enable Halfway Alert</Text>
        <TouchableOpacity
          style={[styles.checkbox, showHalfwayAlert && styles.checkboxChecked]}
          onPress={() => setShowHalfwayAlert(!showHalfwayAlert)}
        />
      </View>

      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={startTimer}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isRunning && styles.buttonDisabled]}
          onPress={stopTimer}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  timerText: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    width: '45%',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  historyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 
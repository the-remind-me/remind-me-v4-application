import React from "react";
import {
  View,
  Text,
  Pressable,
  Linking,
  ScrollView,
  StyleSheet,
} from "react-native";
import { expo } from "@/app.json";
import { Feather } from "@expo/vector-icons";
import ToggleSwitch from "toggle-switch-react-native";
import { useAuth } from '@clerk/clerk-expo';

interface MenuProps {
  isNotificationEnabled: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerText: {
    padding: 24,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4f46e5',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#d1d5db',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  contributeContainer: {
    margin: 20,
    borderWidth: 1,
    padding: 18,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 16,
  },
  contributeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  contributeSubText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  contributeButton: {
    margin: 20,
    borderWidth: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  contributeButtonText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

const Menu: React.FC<MenuProps> = ({
  isNotificationEnabled,
}) => {

  const { isSignedIn } = useAuth();
  const handleContribute = () => {
    Linking.openURL("https://github.com/the-remind-me/remind-me-v4-application");
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.headerText}>Remind Me</Text>
          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardText}>Send Notification</Text>
            <ToggleSwitch
              isOn={isNotificationEnabled}
              onToggle={() => { }}
              size="medium"
              onColor="#4f46e5"
            />
          </View>
        </View>

        <View style={styles.contributeContainer}>
          <Text style={styles.contributeText}>Contribute to Remind Me</Text>
          <Text style={styles.contributeSubText}>
            Love the app? Help us make it even better! Your feedback and
            contributions are always welcome. Feel free to suggest features,
            report bugs, or contribute to the codebase.
          </Text>
        </View>

        <Pressable
          onPress={handleContribute}
          style={styles.contributeButton}
        >
          <Feather name="github" size={24} color="white" />
          <Text style={styles.contributeButtonText}>Contribute</Text>
        </Pressable>
      </ScrollView>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {isSignedIn ? (
          <>
            <Text>Welcome!</Text>

          </>
        ) : (
          <Text>Hello</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>App version: {expo.version}</Text>
        <Text style={styles.footerText}>Team: {expo.devs.lead}</Text>
      </View>
    </View>
  );
};

export default Menu;

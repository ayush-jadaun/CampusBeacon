import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Coming Soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

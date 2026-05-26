import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { palette } from '../theme/palette';

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, multiline = false, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    color: palette.text,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 14,
  },
});

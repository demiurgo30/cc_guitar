import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

// Read-only when onPress is omitted (used on the Songs list and SongDetail);
// interactive when passed (used in the Add/Edit Song modal).
export default function Stars({ value, max = 5, size = 14, onPress }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onPress && onPress(i + 1)} disabled={!onPress}>
          <Text style={{ fontSize: size, color: i < value ? colors.accentLight : colors.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

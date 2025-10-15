import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconName } from './types';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

// Временный компонент иконок (заглушка)
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  // Простая заглушка для иконок
  const iconText = name.charAt(0).toUpperCase();
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>
        {iconText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

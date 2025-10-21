import React, { forwardRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Pressable, StyleSheet, Image } from 'react-native';
import { InputProps, InputVariant, InputSize } from './types';
import { SimpleIcon } from '../Icon/SimpleIcon';
import { Icon } from '../Icon/Icon';

// Универсальный Input компонент
// Варианты: text, password, dropdown, textarea
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      variant = 'text',
      size = 'default',
      label,
      error,
      helperText,
      forceHelperText = false,
      leftIcon,
      rightIcon,
      leftImage,
      forgotPassword = false,
      onForgotPassword,
      showTooltip = false,
      disabled = false,
      dropdownOptions,
      onDropdownSelect,
      containerStyle,
      className = '',
      inputClassName = '',
      labelClassName = '',
      value,
      placeholder = 'Example',
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const filled = !!value;
    const hasError = !!error;

    // Стили для разных состояний
    const getInputStyles = () => {
      const baseStyle = {
        backgroundColor: '#2B2B2B',
        borderRadius: size === 'settings' ? 8 : 16,
        paddingHorizontal: size === 'settings' ? 8 : 16,
        paddingVertical: size === 'settings' ? 8 : 12,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      };

      if (disabled) {
        return { ...baseStyle, backgroundColor: '#2B2B2B', opacity: 0.5 };
      } else if (hasError) {
        return { ...baseStyle, borderWidth: 1, borderColor: '#FF514F' };
      } else if (isFocused) {
        return { 
          ...baseStyle, 
          borderWidth: 1, 
          borderColor: '#BA9BF7',
          // Убираем shadow и elevation - они могут вызывать проблемы с клавиатурой
        };
      } else {
        return baseStyle;
      }
    };

    const getTextColor = () => {
      if (disabled) return '#949494';
      if (filled || isFocused) return '#FFFFFF';
      return '#949494';
    };

    const getIconColor = () => {
      if (disabled) return '#949494';
      return '#FFFFFF';
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleTogglePassword = () => {
      setPasswordVisible(!passwordVisible);
    };

    const handleChangeText = (text: string) => {
      rest.onChangeText?.(text);
    };

    const handleDropdownToggle = () => {
      if (!disabled) {
        setDropdownOpen(!dropdownOpen);
      }
    };

    const renderIcon = (icon: any) => {
      if (!icon) return null;
      
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, { size: 16, color: getIconColor() } as any);
      }
      
      return <SimpleIcon name={icon} size={16} color={getIconColor()} />;
    };

    const renderInput = () => {
      // Textarea variant
      if (variant === 'textarea') {
        return (
          <View style={[getInputStyles(), { minHeight: 112 }]}>
            <TextInput
              ref={ref}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#C1C1C1"
              multiline
              numberOfLines={4}
              editable={!disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChangeText={rest.onChangeText}
              autoCapitalize="sentences"
              autoCorrect={true}
              returnKeyType="default"
              blurOnSubmit={false}
              textAlignVertical="top"
              style={{ 
                color: getTextColor(), 
                flex: 1,
                fontSize: 14,
                fontFamily: 'Onest',
                minHeight: 80,
              }}
            />
            <Text style={{ fontSize: 12, color: '#BEBEC0', alignSelf: 'flex-end', marginTop: 8 }}>
              {value?.length || 0} / 500 символов
            </Text>
          </View>
        );
      }

      // Dropdown variant
      if (variant === 'dropdown') {
        return (
          <TouchableOpacity
            style={[getInputStyles(), { justifyContent: 'space-between' }]}
            onPress={handleDropdownToggle}
            disabled={disabled}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {leftImage && (
                <Image 
                  source={leftImage} 
                  style={{ width: 20, height: 20 }} 
                  resizeMode="contain"
                />
              )}
              {leftIcon && !leftImage && renderIcon(leftIcon)}
              <Text style={{ color: filled ? '#FFFFFF' : '#C1C1C1', fontSize: 14 }}>
                {value || placeholder}
              </Text>
            </View>
            <SimpleIcon 
              name={dropdownOpen ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={getIconColor()} 
            />
          </TouchableOpacity>
        );
      }

      // Text and Password variants
      const isPassword = variant === 'password';
      const showPasswordToggle = isPassword; // Включаем для пароля
      const shouldHidePassword = isPassword && !passwordVisible;

      return (
        <View style={getInputStyles()}>
          {leftImage && (
            <View style={{ marginRight: 8 }}>
              <Image 
                source={leftImage} 
                style={{ width: 20, height: 20 }} 
                resizeMode="contain"
              />
            </View>
          )}
          {leftIcon && !leftImage && <View style={{ marginRight: 8 }}>{renderIcon(leftIcon)}</View>}
          
          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#8F8F92"
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={rest.onChangeText || handleChangeText}
            keyboardType={rest.keyboardType || 'default'}
            secureTextEntry={shouldHidePassword}
            style={{ 
              color: getTextColor(), 
              flex: 1,
              fontSize: 14,
              fontFamily: 'Onest',
            }}
          />

          {showPasswordToggle && (
            <Pressable 
              onPress={handleTogglePassword} 
              style={{ 
                marginLeft: 8, 
                padding: 8,
                backgroundColor: 'transparent',
                borderRadius: 4,
                minWidth: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                name={passwordVisible ? "eye" : "eye-slash"} 
                size={16} 
                color="#FFFFFF" 
              />
            </Pressable>
          )}

          {rightIcon && !showPasswordToggle && (
            <View style={{ marginLeft: 8 }}>{renderIcon(rightIcon)}</View>
          )}
        </View>
      );
    };

    return (
      <View style={[{ flexDirection: 'column' }, containerStyle]}>
        {/* Label with optional tooltip */}
        {label && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#FFFFFF', fontFamily: 'Onest' }}>
              {label}
            </Text>
            {showTooltip && (
              <SimpleIcon name="info" size={16} color="#FFFFFF" />
            )}
          </View>
        )}

        {/* Input field */}
        {renderInput()}

        {/* Error message or Helper text */}
        {error && (
          <Text style={{ fontSize: 12, marginTop: 8, color: '#FF514F' }}>{error}</Text>
        )}
        
        {helperText && (!error || forceHelperText) && (
          <Text style={{ fontSize: 12, marginTop: 8, color: '#FFFFFF' }}>{helperText}</Text>
        )}

        {/* Forgot password link */}
        {variant === 'password' && forgotPassword && (
          <TouchableOpacity 
            onPress={onForgotPassword}
            style={{ alignSelf: 'flex-end', marginTop: 8 }}
          >
            <Text style={{ fontSize: 12, color: '#BEBEC0' }}>
              Забыли пароль?
            </Text>
          </TouchableOpacity>
        )}

        {/* Dropdown options */}
        {variant === 'dropdown' && dropdownOpen && dropdownOptions && (
          <View style={{ marginTop: 8, backgroundColor: '#2B2B2B', borderRadius: 8, overflow: 'hidden' }}>
            {dropdownOptions.map((option) => (
              <Pressable
                key={option.value}
                style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                onPress={() => {
                  onDropdownSelect?.(option.value);
                  setDropdownOpen(false);
                }}
              >
                <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';


import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InputProps } from './types';

// Упрощенный Input компонент без NativeWind и сложных зависимостей
export const FixedInput = forwardRef<TextInput, InputProps>(
  (
    {
      variant = 'text',
      size = 'default',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
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
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const filled = !!value;
    const hasError = !!error;

    // Очистка таймаута при размонтировании
    useEffect(() => {
      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
      };
    }, []);

    const handleFocus = (e: any) => {
      console.log('FixedInput: Focus event triggered');
      
      // Очищаем предыдущий таймаут если есть
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
      
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      console.log('FixedInput: Blur event triggered');
      
      // Добавляем небольшую задержку перед blur чтобы избежать конфликтов
      focusTimeoutRef.current = setTimeout(() => {
        setIsFocused(false);
        onBlur?.(e);
      }, 100);
    };

    const handleTogglePassword = () => {
      setPasswordVisible(!passwordVisible);
    };

    const handleDropdownToggle = () => {
      if (!disabled) {
        setDropdownOpen(!dropdownOpen);
      }
    };

    const handleChangeText = (text: string) => {
      console.log('FixedInput: Text changed to:', text);
      rest.onChangeText?.(text);
    };

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
          shadowColor: '#BA9BF7',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 5,
          elevation: 5,
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

    const renderIcon = (icon: any) => {
      if (!icon) return null;
      
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, { size: 16, color: getIconColor() } as any);
      }
      
      // Простая заглушка для иконок
      return (
        <View style={{ width: 16, height: 16, backgroundColor: getIconColor(), borderRadius: 2 }} />
      );
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
              onChangeText={handleChangeText}
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
              // Отключаем внешние обработчики событий чтобы избежать конфликтов
              onFocusCapture={undefined}
              onBlurCapture={undefined}
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
              {leftIcon && renderIcon(leftIcon)}
              <Text style={{ color: filled ? '#FFFFFF' : '#C1C1C1', fontSize: 14 }}>
                {value || placeholder}
              </Text>
            </View>
            <View style={{ width: 16, height: 16, backgroundColor: getIconColor(), borderRadius: 2 }} />
          </TouchableOpacity>
        );
      }

      // Text and Password variants
      const isPassword = variant === 'password';
      const showPasswordToggle = isPassword;
      const shouldHidePassword = isPassword && !passwordVisible;

      return (
        <View style={getInputStyles()}>
          {leftIcon && <View style={{ marginRight: 8 }}>{renderIcon(leftIcon)}</View>}
          
          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#8F8F92"
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={rest.keyboardType || 'default'}
            returnKeyType={rest.returnKeyType || 'done'}
            secureTextEntry={shouldHidePassword}
            blurOnSubmit={true}
            textContentType={rest.textContentType}
            autoComplete={rest.autoComplete}
            style={{ 
              color: getTextColor(), 
              flex: 1,
              fontSize: 14,
              fontFamily: 'Onest',
              minHeight: 20,
            }}
            // Отключаем внешние обработчики событий чтобы избежать конфликтов
            onFocusCapture={undefined}
            onBlurCapture={undefined}
          />

          {showPasswordToggle && (
            <TouchableOpacity 
              onPress={handleTogglePassword} 
              style={{ marginLeft: 8 }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={{ width: 16, height: 16, backgroundColor: getIconColor(), borderRadius: 2 }} />
            </TouchableOpacity>
          )}

          {rightIcon && !showPasswordToggle && (
            <View style={{ marginLeft: 8 }}>{renderIcon(rightIcon)}</View>
          )}
        </View>
      );
    };

    return (
      <View style={[{ flexDirection: 'column' }, containerStyle]}>
        {/* Label */}
        {label && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#FFFFFF', fontFamily: 'Onest' }}>
              {label}
            </Text>
            {showTooltip && (
              <View style={{ width: 16, height: 16, backgroundColor: '#FFFFFF', borderRadius: 2 }} />
            )}
          </View>
        )}

        {/* Input field */}
        {renderInput()}

        {/* Error message or Helper text */}
        {error && (
          <Text style={{ fontSize: 12, marginTop: 8, color: '#FF514F' }}>{error}</Text>
        )}
        
        {helperText && !error && (
          <Text style={{ fontSize: 12, marginTop: 8, color: '#BEBEC0' }}>{helperText}</Text>
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
              <TouchableOpacity
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  },
);

FixedInput.displayName = 'FixedInput';

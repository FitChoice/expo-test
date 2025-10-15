import React, { forwardRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Pressable } from 'react-native';
import { InputProps } from './types';
import { getInputStyles, getTextareaStyles, getTextColor, getIconColor } from './styles';
import { Icon } from '../Icon';

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

    const filled = !!value;
    const hasError = !!error;

    const {
      containerClasses,
      inputClasses,
      labelClasses,
      errorClasses,
      helperClasses,
    } = getInputStyles(variant, size, disabled, hasError, isFocused);

    const textColor = getTextColor(disabled, filled, isFocused);
    const iconColor = getIconColor(disabled);

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

    const handleDropdownToggle = () => {
      if (!disabled) {
        setDropdownOpen(!dropdownOpen);
      }
    };

    const renderIcon = (icon: any) => {
      if (!icon) return null;
      
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, { size: 16, color: iconColor } as any);
      }
      
      return <Icon name={icon} size={16} color={iconColor} />;
    };

    const renderInput = () => {
      // Textarea variant
      if (variant === 'textarea') {
        const textareaClasses = getTextareaStyles(disabled, hasError, isFocused);
        
        return (
          <View className={`${textareaClasses} ${inputClassName}`}>
            <TextInput
              ref={ref}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#C1C1C1" // Light text/200
              multiline
              numberOfLines={4}
              editable={!disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ color: textColor, flex: 1 }}
              {...rest}
            />
            <Text className="text-xs text-light-text-200 self-end mt-2">
              {value?.length || 0} / 500 символов
            </Text>
          </View>
        );
      }

      // Dropdown variant
      if (variant === 'dropdown') {
        return (
          <TouchableOpacity
            className={`${inputClasses} ${inputClassName} justify-between`}
            onPress={handleDropdownToggle}
            disabled={disabled}
          >
            <View className="flex-row items-center gap-2">
              {leftIcon && renderIcon(leftIcon)}
              <Text style={{ color: filled ? '#FFFFFF' : '#C1C1C1' }} className="text-sm">
                {value || placeholder}
              </Text>
            </View>
            <Icon 
              name={dropdownOpen ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={iconColor} 
            />
          </TouchableOpacity>
        );
      }

      // Text and Password variants
      const isPassword = variant === 'password';
      const showPasswordToggle = isPassword && filled;

      return (
        <View className={`${inputClasses} ${inputClassName}`}>
          {leftIcon && <View className="mr-2">{renderIcon(leftIcon)}</View>}
          
          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#8F8F92" // Light text/500
            secureTextEntry={isPassword && !passwordVisible}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ 
              color: textColor, 
              flex: 1,
              fontSize: 14,
              fontFamily: 'Onest',
            }}
            {...rest}
          />

          {showPasswordToggle && (
            <TouchableOpacity onPress={handleTogglePassword} className="ml-2">
              <Icon 
                name={passwordVisible ? "eye" : "eye"} 
                size={16} 
                color={iconColor} 
              />
            </TouchableOpacity>
          )}

          {rightIcon && !showPasswordToggle && (
            <View className="ml-2">{renderIcon(rightIcon)}</View>
          )}
        </View>
      );
    };

    return (
      <View className={`${containerClasses} ${className}`} style={containerStyle}>
        {/* Label with optional tooltip */}
        {label && (
          <View className="flex-row items-center gap-1 mb-3">
            <Text className={`${labelClasses} ${labelClassName}`}>
              {label}
            </Text>
            {showTooltip && (
              <Icon name="info" size={16} color="#FFFFFF" />
            )}
          </View>
        )}

        {/* Input field */}
        {renderInput()}

        {/* Error message or Helper text */}
        {error && (
          <Text className={errorClasses}>{error}</Text>
        )}
        
        {helperText && !error && (
          <Text className={helperClasses}>{helperText}</Text>
        )}

        {/* Forgot password link */}
        {variant === 'password' && forgotPassword && (
          <TouchableOpacity 
            onPress={onForgotPassword}
            className="self-end mt-2"
          >
            <Text className="text-xs text-light-text-200">
              Забыли пароль?
            </Text>
          </TouchableOpacity>
        )}

        {/* Dropdown options (если открыт) */}
        {variant === 'dropdown' && dropdownOpen && dropdownOptions && (
          <View className="mt-2 bg-fill-800 rounded-lg overflow-hidden">
            {dropdownOptions.map((option) => (
              <Pressable
                key={option.value}
                className="px-4 py-3 active:bg-fill-700"
                onPress={() => {
                  onDropdownSelect?.(option.value);
                  setDropdownOpen(false);
                }}
              >
                <Text className="text-sm text-light-text-100">
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


import { forwardRef, useState, cloneElement, isValidElement } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ButtonProps } from './types';
import { buttonVariantStyles, buttonSizeStyles, baseButtonStyles } from './styles';

// Универсальный компонент кнопки
// Варианты: primary, secondary, special, tertiary, ghost
// Размеры: xs, s, l
export const Button = forwardRef<View, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 's',
      iconLeft,
      iconRight,
      iconOnly = false,
      disabled = false,
      fullWidth = false,
      className = '',
      ...touchableProps
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    // Получаем стили для варианта и размера
    const variantStyle = buttonVariantStyles[variant];
    const sizeStyle = buttonSizeStyles[size];

    // Определяем текущее состояние кнопки
    const currentState = disabled ? 'disabled' : isPressed ? 'pressed' : 'default';

    // Формируем классы для контейнера
    const containerClasses = [
      baseButtonStyles,
      sizeStyle.container,
      variantStyle[currentState],
      fullWidth ? 'w-full' : '',
      iconOnly ? sizeStyle.paddingIconOnly : 
        iconLeft ? sizeStyle.paddingIconLeft :
        iconRight ? sizeStyle.paddingIconRight :
        sizeStyle.padding,
      className,
    ].filter(Boolean).join(' ');

    // Формируем классы для текста
    const textClasses = [
      sizeStyle.text,
      variantStyle[`text${currentState.charAt(0).toUpperCase() + currentState.slice(1)}` as keyof typeof variantStyle],
    ].filter(Boolean).join(' ');

    // Клонируем иконки с нужным размером и цветом
    const renderIcon = (icon: React.ReactNode) => {
      if (!isValidElement(icon)) return icon;
      
      const iconColor = variantStyle[`text${currentState.charAt(0).toUpperCase() + currentState.slice(1)}` as keyof typeof variantStyle]
        .replace('text-', '')
        .replace('[', '')
        .replace(']', '');

      return cloneElement(icon as React.ReactElement<any>, {
        size: sizeStyle.icon,
        color: iconColor.startsWith('#') ? iconColor : undefined,
      });
    };

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        activeOpacity={0.8}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        className={containerClasses}
        {...touchableProps}
      >
        {iconLeft && !iconOnly && renderIcon(iconLeft)}
        {iconOnly && iconLeft && renderIcon(iconLeft)}
        {!iconOnly && <Text className={textClasses}>{children}</Text>}
        {iconRight && !iconOnly && renderIcon(iconRight)}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
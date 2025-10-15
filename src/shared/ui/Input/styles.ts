import { InputVariant, InputSize } from './types';

// Стили для Input компонента
interface InputStyles {
  containerClasses: string;
  inputClasses: string;
  labelClasses: string;
  errorClasses: string;
  helperClasses: string;
}

export const getInputStyles = (
  variant: InputVariant,
  size: InputSize,
  disabled: boolean,
  error: boolean,
  isFocused: boolean,
): InputStyles => {
  let containerClasses = 'flex flex-col ';
  let inputClasses = 'flex-row items-center ';
  let labelClasses = 'text-sm mb-3 text-light-text-100 '; // t3 regular
  let errorClasses = 'text-xs mt-2 text-feedback-negative-900 '; // t4
  let helperClasses = 'text-xs mt-2 text-light-text-200 '; // t4

  // Размеры
  if (size === 'settings') {
    // Settings field/dropdown - 8px border radius, меньше padding
    inputClasses += 'rounded-lg px-2 py-2 '; // 8px
  } else {
    // Default - 16px border radius
    inputClasses += 'rounded-2xl px-4 py-3 '; // 16px, padding 12px 16px
  }

  // Состояния для основных инпутов
  if (size === 'default') {
    if (disabled) {
      // Disabled state
      inputClasses += 'bg-fill-200 opacity-50 ';
      labelClasses += 'opacity-50 ';
    } else if (error) {
      // Error state
      inputClasses += 'bg-fill-800 border border-feedback-negative-900 ';
    } else if (isFocused) {
      // Focused state
      inputClasses += 'bg-fill-700 border border-brand-purple-500 shadow-[0px_0px_5px_0px_rgba(187,162,254,0.8)] ';
    } else {
      // Default state
      inputClasses += 'bg-fill-800 ';
    }
  } else {
    // Settings variant states
    if (disabled) {
      inputClasses += 'bg-fill-200 opacity-50 ';
    } else if (isFocused) {
      inputClasses += 'border border-brand-purple-900 shadow-[0px_0px_5px_0px_rgba(187,162,254,1)] ';
    } else {
      inputClasses += 'border border-fill-300 ';
    }
  }

  return {
    containerClasses,
    inputClasses,
    labelClasses,
    errorClasses,
    helperClasses,
  };
};

// Стили для textarea
export const getTextareaStyles = (
  disabled: boolean,
  error: boolean,
  isFocused: boolean,
): string => {
  let classes = 'rounded-lg px-4 py-3 min-h-[112px] '; // 8px border radius, 12px 16px padding

  if (disabled) {
    classes += 'bg-fill-200 border-0 opacity-50 ';
  } else if (error) {
    classes += 'bg-white border border-feedback-negative-900 ';
  } else if (isFocused) {
    classes += 'border border-brand-purple-900 shadow-[0px_2px_5px_0px_rgba(187,162,254,0.8)] ';
  } else {
    classes += 'border border-fill-300 ';
  }

  return classes;
};

// Цвет текста
export const getTextColor = (
  disabled: boolean,
  filled: boolean,
  isFocused: boolean,
): string => {
  if (disabled) {
    return '#8F8F92'; // Light text/500
  }
  if (filled || isFocused) {
    return '#FFFFFF'; // Light text/100
  }
  return '#8F8F92'; // Light text/500 для placeholder
};

// Цвет иконки
export const getIconColor = (disabled: boolean): string => {
  if (disabled) {
    return '#8F8F92'; // Light text/500
  }
  return '#FFFFFF'; // Light text/100
};


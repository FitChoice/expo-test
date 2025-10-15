import { ButtonVariant, ButtonSize } from './types';

// Стили для вариантов кнопок
export const buttonVariantStyles: Record<ButtonVariant, {
  default: string;
  pressed: string;
  disabled: string;
  textDefault: string;
  textPressed: string;
  textDisabled: string;
}> = {
  primary: {
    default: 'bg-[#C5F680]',           // Brand/Green 500
    pressed: 'bg-[#AAEC4D]',           // Brand/Green 900
    disabled: 'bg-[#C5F680] opacity-50',
    textDefault: 'text-[#161616]',     // Light text/900
    textPressed: 'text-[#161616]',
    textDisabled: 'text-[#161616]',
  },
  secondary: {
    default: 'bg-white',               // Pure white
    pressed: 'bg-[#EAEAEA]',           // Fill/300
    disabled: 'bg-[#F4F4F4] opacity-50', // Fill/200
    textDefault: 'text-[#161616]',     // Light text/900
    textPressed: 'text-[#161616]',
    textDisabled: 'text-[#161616]',
  },
  special: {
    default: 'bg-[#BA9BF7]',           // Brand/Purple 500
    pressed: 'bg-[#A172FF]',           // Brand/Purple 900
    disabled: 'bg-[#DDCDFB] opacity-50', // Brand/Purple 300
    textDefault: 'text-white',         // Light text/100
    textPressed: 'text-white',
    textDisabled: 'text-white',
  },
  tertiary: {
    default: 'bg-[#3F3F3F]',           // Fill/700
    pressed: 'bg-[#2B2B2B]',           // Fill/800
    disabled: 'bg-[#3F3F3F] opacity-50',
    textDefault: 'text-white',         // Light text/100
    textPressed: 'text-white',
    textDisabled: 'text-[#C1C1C1]',    // Light text/200
  },
  ghost: {
    default: 'bg-transparent',
    pressed: 'bg-[#F4F4F4]',           // Fill/200
    disabled: 'bg-transparent opacity-50',
    textDefault: 'text-[#949494]',     // Light text/500
    textPressed: 'text-[#161616]',     // Light text/900
    textDisabled: 'text-[#C1C1C1]',    // Light text/200
  },
};

// Стили для размеров кнопок
export const buttonSizeStyles: Record<ButtonSize, {
  container: string;
  text: string;
  icon: number;
  padding: string;
  paddingIconLeft: string;
  paddingIconRight: string;
  paddingIconOnly: string;
}> = {
  xs: {
    container: 'h-[40px] rounded-2xl',
    text: 'text-sm font-medium',        // Text/t3
    icon: 24,
    padding: 'px-6 py-2',
    paddingIconLeft: 'pl-4 pr-6 py-2',
    paddingIconRight: 'pl-6 pr-4 py-2',
    paddingIconOnly: 'p-2',
  },
  s: {
    container: 'h-[48px] rounded-2xl',
    text: 'text-base font-semibold',    // Text/t2 bold
    icon: 24,
    padding: 'px-6 py-2',
    paddingIconLeft: 'pl-4 pr-6 py-2',
    paddingIconRight: 'pl-6 pr-4 py-2',
    paddingIconOnly: 'p-2',
  },
  l: {
    container: 'h-[56px] rounded-2xl',
    text: 'text-base font-semibold',    // Text/t2 bold
    icon: 32,
    padding: 'px-6 py-2',
    paddingIconLeft: 'pl-4 pr-6 py-2',
    paddingIconRight: 'pl-6 pr-4 py-2',
    paddingIconOnly: 'p-2',
  },
};

// Базовые стили кнопки
export const baseButtonStyles = 'flex-row items-center justify-center gap-2';

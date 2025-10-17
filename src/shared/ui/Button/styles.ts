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
    container: 'h-10 min-h-[36px] rounded-2xl sm:h-[40px]',
    text: 'text-sm font-medium',        // Text/t3
    icon: 20,
    padding: 'px-4 py-2 sm:px-6',
    paddingIconLeft: 'pl-3 pr-4 py-2 sm:pl-4 sm:pr-6',
    paddingIconRight: 'pl-4 pr-3 py-2 sm:pl-6 sm:pr-4',
    paddingIconOnly: 'p-1.5 sm:p-2',
  },
  s: {
    container: 'h-12 min-h-[44px] rounded-2xl sm:h-[48px]',
    text: 'text-base font-semibold',    // Text/t2 bold
    icon: 24,
    padding: 'px-4 py-2 sm:px-6',
    paddingIconLeft: 'pl-3 pr-4 py-2 sm:pl-4 sm:pr-6',
    paddingIconRight: 'pl-4 pr-3 py-2 sm:pl-6 sm:pr-4',
    paddingIconOnly: 'p-1.5 sm:p-2',
  },
  l: {
    container: 'h-14 min-h-[52px] rounded-2xl sm:h-[56px]',
    text: 'text-base font-semibold',    // Text/t2 bold
    icon: 28,
    padding: 'px-4 py-2 sm:px-6',
    paddingIconLeft: 'pl-3 pr-4 py-2 sm:pl-4 sm:pr-6',
    paddingIconRight: 'pl-4 pr-3 py-2 sm:pl-6 sm:pr-4',
    paddingIconOnly: 'p-1.5 sm:p-2',
  },
};

// Базовые стили кнопки
export const baseButtonStyles = 'flex-row items-center justify-center gap-2';

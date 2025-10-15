import { IconName } from './types';
import { ComponentType } from 'react';

// Маппинг имен иконок к SVG компонентам
export const iconMap: Record<IconName, ComponentType<any>> = {
  // Навигация
  'chevron-down': require('./assets/chevron-down.svg'),
  'chevron-left': require('./assets/chevron-left.svg'),
  'chevron-right': require('./assets/chevron-right.svg'),
  'chevron-up': require('./assets/chevron-up.svg'),
  'arrow-forward': require('./assets/arrow-forward.svg'),
  'arrow-back': require('./assets/arrow-back.svg'),
  
  // Действия
  'close': require('./assets/close.svg'),
  'check': require('./assets/check.svg'),
  'check-circle': require('./assets/check-circle.svg'),
  'plus': require('./assets/plus.svg'),
  'share': require('./assets/share.svg'),
  'reload': require('./assets/reload.svg'),
  'sign-out': require('./assets/sign-out.svg'),
  'trash-simple': require('./assets/trash-simple.svg'),
  'pencil-simple': require('./assets/pencil-simple.svg'),
  
  // Информация
  'info': require('./assets/info.svg'),
  'warning': require('./assets/warning.svg'),
  'eye': require('./assets/eye.svg'),
  
  // Пользователь
  'user': require('./assets/user.svg'),
  'user-circle': require('./assets/user-circle.svg'),
  'gear-fine': require('./assets/gear-fine.svg'),
  'dots-three-vertical': require('./assets/dots-three-vertical.svg'),
  'gender-female': require('./assets/gender-female.svg'),
  'gender-male': require('./assets/gender-male.svg'),
  
  // Контент
  'house': require('./assets/house.svg'),
  'camera': require('./assets/camera.svg'),
  'file': require('./assets/file.svg'),
  'image': require('./assets/image.svg'),
  
  // Фитнес
  'timer': require('./assets/timer.svg'),
  'fire': require('./assets/fire.svg'),
  'lightning': require('./assets/lightning.svg'),
  'calendar-dots': require('./assets/calendar-dots.svg'),
  'ruler': require('./assets/ruler.svg'),
  'barbell': require('./assets/barbell.svg'),
  
  // Здоровье
  'health-knees': require('./assets/health-knees.svg'),
  'health-neck-shoulders': require('./assets/health-neck-shoulders.svg'),
  'health-back-pain': require('./assets/health-back-pain.svg'),
  'health-pregnancy': require('./assets/health-pregnancy.svg'),
  'health-childbirth': require('./assets/health-childbirth.svg'),
  'health-varicose': require('./assets/health-varicose.svg'),
  'health-hernia': require('./assets/health-hernia.svg'),
  'health-scoliosis': require('./assets/health-scoliosis.svg'),
  'health-hip': require('./assets/health-hip.svg'),
  'health-pressure': require('./assets/health-pressure.svg'),
  'health-wellbeing': require('./assets/health-wellbeing.svg'),
  
  // Цели
  'goal-lose-weight': require('./assets/goal-lose-weight.svg'),
  'goal-pain-relief': require('./assets/goal-pain-relief.svg'),
  'goal-reduce-stress': require('./assets/goal-reduce-stress.svg'),
  'goal-flexibility': require('./assets/goal-flexibility.svg'),
  'goal-posture': require('./assets/goal-posture.svg'),
  'goal-strengthen': require('./assets/goal-strengthen.svg'),
  'goal-energy': require('./assets/goal-energy.svg'),
  
  // Типы тренировок
  'workout-therapeutic': require('./assets/workout-therapeutic.svg'),
  'workout-rehabilitation': require('./assets/workout-rehabilitation.svg'),
  'workout-meditation': require('./assets/workout-meditation.svg'),
  'workout-stretching': require('./assets/workout-stretching.svg'),
  'workout-cardio': require('./assets/workout-cardio.svg'),
  'workout-strength': require('./assets/workout-strength.svg'),
  'workout-healthy-back': require('./assets/workout-healthy-back.svg'),
  
  // Навигация приложения
  'main': require('./assets/main.svg'),
  'additional': require('./assets/additional.svg'),
  'diary': require('./assets/diary.svg'),
  'back': require('./assets/back.svg'),
};

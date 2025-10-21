import React from 'react'
import { View, StyleSheet, Dimensions, Image } from 'react-native'

// PNG изображения кругов с размытием
const greenCircleImage = require('../../../../assets/images/green-circle.png')
const purpleCircleImage = require('../../../../assets/images/purple-circle.png')

/**
 * Компонент контентного контейнера с декоративными элементами
 * Включает светлый фон и размытые цветные круги как единое целое
 */
export const BackgroundLayout = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = Dimensions.get('window')
  
  // Адаптивные позиции (процент от размера экрана)
  const greenCircleTop = height * -0.25 // -25% от высоты экрана (поднимаем зеленый еще выше)
  const purpleCircleTop = height * 0.05 // 5% от высоты экрана (фиолетовый остается на месте)

  const dynamicStyles = StyleSheet.create({
    rightCircle: {
      position: 'absolute',
      top: purpleCircleTop,
      right: 0, // Прикреплен к правой границе
      width: 873,
      height: 873,
    },
    leftCircle: {
      position: 'absolute',
      top: greenCircleTop,
      left: 0, // Прикреплен к левой границе
      width: 873,
      height: 873,
    },
  })

  return (
    <View style={styles.container}>
      {/* Декоративные элементы внутри контентного контейнера */}
      <View style={styles.decorativeContainer}>
        {/* Фиолетовый круг с размытием - справа, выше середины экрана */}
        <Image source={purpleCircleImage} style={dynamicStyles.rightCircle} resizeMode="contain" />
        {/* Зеленый круг с размытием - слева, самый верхний */}
        <Image source={greenCircleImage} style={dynamicStyles.leftCircle} resizeMode="contain" />
      </View>
      
      {/* Контент поверх декоративных элементов */}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // BG/Dark 500 BG - контентный контейнер
    borderRadius: 32,
    paddingHorizontal: '4%', // Относительно ширины контейнера
    position: 'relative', // Для позиционирования декоративных элементов
    zIndex: 3, // Поверх браслета и заголовка
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // Под контентом
  },
})

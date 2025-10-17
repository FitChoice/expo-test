import React from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Button, CircularText } from '@/shared/ui'
import { useFonts, useOrientation } from '@/shared/lib'

/**
 * Landing page - посадочная страница с декоративными элементами
 * Содержит заголовок "Время действовать" и две кнопки навигации
 */
export const LandingScreen = () => {
  const router = useRouter()
  const { getFontName } = useFonts()
  
  // Блокируем поворот экрана в портретную ориентацию
  useOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  
  // Получаем размеры экрана для адаптивности
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  
  // Адаптивные размеры круга (сохраняем пропорции от оригинального макета)
  const circleSize = Math.min(screenWidth * 0.18, screenHeight * 0.085) // ~72px на стандартном экране
  const circleOffset = circleSize * 0.22 // ~16px на стандартном экране
  
  const handleRegister = () => {
    router.push('/auth')
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#151515' }}>
      {/* Верхний контейнер Frame 48097890 */}
      <View style={{ 
        width: '92.8%', // 362px из 390px ≈ 92.8%
        height: '58.1%', // 490px из 844px ≈ 58.1%
        marginHorizontal: '3.6%', // 14px из 390px ≈ 3.6%
        marginTop: '3.6%', // 14px из 390px ≈ 3.6%
        backgroundColor: '#1E1E1E', 
        borderRadius: 40, 
        overflow: 'hidden',
        position: 'relative'
      }}>
          {/* Фиолетовый круг Frame 313 */}
          <View style={{
            position: 'absolute',
            width: circleSize, // Адаптивный размер, но всегда круг
            height: circleSize, // Адаптивный размер, но всегда круг
            backgroundColor: '#BA9BF7',
            borderRadius: circleSize / 2, // Половина от размера для идеального круга
            top: circleOffset, // Адаптивное расстояние от верха
            left: circleOffset // Адаптивное расстояние от левого края
          }} />
          
          {/* Group 314 с фотокарточкой и декоративными элементами */}
          <View style={{ 
            position: 'absolute', 
            left: '60%', // Сдвинуто правее
            width: '40%', // Увеличена ширина
            height: '90%', // Увеличена высота
            top: '0%' // Поднято выше для сохранения нижней границы
          }}>
            {/* Декоративные элементы Mask group - круговой текст (позади изображения) */}
            <View style={{ 
              position: 'absolute', 
              width: '90%', // Адаптивная ширина относительно контейнера изображения
              height: '45%', // Адаптивная высота относительно контейнера изображения
              top: '22%', // Поднято выше
              left: '-42%' // Еще больше сдвинуто левее
            }}>
              {/* Слой 1: Текст позади изображения (полностью видимый) */}
              <CircularText
                text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
                width={screenWidth * 0.69} // Адаптивная ширина
                height={screenHeight * 0.16} // Адаптивная высота
                centerX={screenWidth * 0.39} // Адаптивный центр X
                centerY={screenHeight * 0.13} // Адаптивный центр Y
                fontSize={screenWidth * 0.039} // Адаптивный размер шрифта
                fill="#FFFFFF"
                startOffset="0%"
                fontWeight="300"
                letterSpacing="-3%"
                rotation={-17.05}
                debug={false}
              />
            </View>
            
            {/* Основная фотокарточка IMG_3254 2 */}
            <Image
              source={require('../../../../assets/images/landing-photo-1.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            
            {/* Слой 2: Текст перед изображением (только в области маски) */}
            <View style={{ 
              position: 'absolute', 
              width: '90%', // Адаптивная ширина относительно контейнера изображения
              height: '45%', // Адаптивная высота относительно контейнера изображения
              top: '22%', // Поднято выше
              left: '-42%' // Еще больше сдвинуто левее
            }}>
              <CircularText
                text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
                width={screenWidth * 0.69} // Адаптивная ширина
                height={screenHeight * 0.16} // Адаптивная высота
                centerX={screenWidth * 0.39} // Адаптивный центр X
                centerY={screenHeight * 0.13} // Адаптивный центр Y
                fontSize={screenWidth * 0.039} // Адаптивный размер шрифта
                fill="#FFFFFF"
                startOffset="0%"
                fontWeight="300"
                letterSpacing="-3%"
                rotation={-17.05}
                debug={false}
                maskRect={{
                  x: screenWidth * 0.13, // Адаптивная позиция маски X
                  y: screenHeight * 0.14, // Адаптивная позиция маски Y
                  width: screenWidth * 0.51, // Адаптивная ширина маски
                  height: screenHeight * 0.12 // Адаптивная высота маски
                }}
              />
            </View>
          </View>

          {/* Заголовок "Время действовать" */}
          <View style={{ 
            position: 'absolute', 
            left: '7%', // Относительно ширины контейнера
            width: '87%', // Относительно ширины контейнера
            height: '15%', // Относительно высоты контейнера
            top: '85%' // Поднят к верхнему краю контейнера
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 34,
              fontWeight: '700',
              fontStyle: 'normal',
              lineHeight: 35,
              fontFamily: getFontName('Rimma_sans-Bold', 'system')
            }}>
              Время действовать
            </Text>
          </View>
      </View>

      {/* Нижний контейнер Frame 48097894 */}
      <View style={{ 
        width: '92.8%', // 362px из 390px ≈ 92.8%
        height: '38.6%', // 326px из 844px ≈ 38.6%
        marginHorizontal: '3.6%', // 14px из 390px ≈ 3.6%
        marginBottom: '3.6%', // 14px из 390px ≈ 3.6%
        backgroundColor: '#4B4B4B', 
        borderRadius: 40, 
        position: 'relative' 
      }}>
          {/* Фотокарточка Group 310 */}
          <View style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            top: 0, 
            left: 0,
            borderRadius: 40,
            overflow: 'hidden'
          }}>
            {/* Основное изображение */}
            <Image
              source={require('../../../../assets/images/landing-photo-2.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Кнопки Frame 48097895 */}
          <View style={{ 
            position: 'absolute', 
            left: '4%', // Относительно ширины контейнера
            width: '92%', // Относительно ширины контейнера
            top: '58%' // Относительно высоты контейнера
          }}>
            <View style={{ gap: 8 }}>
              <Button
                variant="primary"
                size="l"
                fullWidth
                onPress={handleRegister}
              >
                Зарегистрироваться
              </Button>
              <Button
                variant="secondary"
                size="l"
                fullWidth
                onPress={handleLogin}
              >
                Войти
              </Button>
            </View>
          </View>
      </View>
    </View>
  )
}

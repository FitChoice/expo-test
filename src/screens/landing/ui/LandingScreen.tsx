import React from 'react'
import { View, Text, Image } from 'react-native'
import { router } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Button, CircularText } from '@/shared/ui'

/**
 * Landing page - посадочная страница с декоративными элементами
 * Содержит заголовок "Время действовать" и две кнопки навигации
 */
export const LandingScreen = () => {
  const handleRegister = () => {
    router.push('/auth')
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#151515' }}>
      {/* Основной контейнер с фоном */}
      <View style={{ 
        flex: 1, 
        margin: 14, 
        backgroundColor: '#1E1E1E', 
        borderRadius: 40, 
        overflow: 'hidden' 
      }}>
        {/* Верхняя секция Frame 48097890 */}
        <View style={{ width: 362, height: 490, position: 'relative' }}>
          {/* Фиолетовый эллипс Frame 313 */}
          <View style={{
            position: 'absolute',
            width: 72,
            height: 72,
            backgroundColor: '#BA9BF7',
            borderRadius: 36,
            top: 16,
            left: 16
          }} />
          
          {/* Group 314 с фотокарточкой и декоративными элементами */}
          <View style={{ 
            position: 'absolute', 
            left: 125, 
            width: 315, 
            height: 473, 
            top: -26
          }}>
            {/* Декоративные элементы Mask group - круговой текст (позади изображения) */}
            <View style={{ 
              position: 'absolute', 
              width: 305, 
              height: 217, 
              top: 119, 
              left: 3 
            }}>
              {/* Слой 1: Текст позади изображения (полностью видимый) */}
              <CircularText
                text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
                width={269.1}
                height={135.97}
                centerX={152.5}
                centerY={108.5}
                fontSize={15.24}
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
              width: 305, 
              height: 217, 
              top: 119, 
              left: 3 
            }}>
              <CircularText
                text="fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice fit choice"
                width={269.1}
                height={135.97}
                centerX={152.5}
                centerY={108.5}
                fontSize={15.24}
                fill="#FFFFFF"
                startOffset="0%"
                fontWeight="300"
                letterSpacing="-3%"
                rotation={-17.05}
                debug={false}
                maskRect={{
                  x: 50,
                  y: 117,
                  width: 200,
                  height: 100
                }}
              />
            </View>
          </View>

          {/* Заголовок "Время действовать" */}
          <View style={{ 
            position: 'absolute', 
            left: 24, 
            width: 314, 
            height: 71, 
            top: 395 
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 34,
              fontWeight: '700',
              fontStyle: 'normal',
              lineHeight: 35,
              fontFamily: 'Rimma_sans-Bold'
            }}>
              Время действовать
            </Text>
          </View>
        </View>

        {/* Нижняя секция Frame 48097894 */}
        <View style={{ 
          width: 362, 
          height: 326, 
          backgroundColor: '#4B4B4B', 
          borderRadius: 40, 
          position: 'relative' 
        }}>
          {/* Фотокарточка Group 310 */}
          <View style={{ 
            position: 'absolute', 
            width: 362, 
            height: 326, 
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
            left: 16, 
            width: 330, 
            top: 190 
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
    </View>
  )
}

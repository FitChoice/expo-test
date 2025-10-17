import React from 'react'
import { View } from 'react-native'
import Svg, { Defs, Text as SvgText, Mask, Rect } from 'react-native-svg'
import { useFonts } from '@/shared/lib'

interface MaskedTextProps {
  text: string
  width?: number
  height?: number
  x?: number
  y?: number
  fontSize?: number
  fill?: string
  fontWeight?: string
  letterSpacing?: string
  textAlign?: 'start' | 'middle' | 'end'
  fontFamily?: string
  debug?: boolean
  maskRect?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Компонент для отображения текста с маской
 */
export const MaskedText = ({
  text,
  width = 400,
  height = 40,
  x = 200,
  y = 20,
  fontSize = 29.64,
  fill = '#FFFFFF',
  fontWeight = '700',
  letterSpacing = '-0.03',
  textAlign = 'middle',
  fontFamily = 'Rimma_sans',
  debug = false,
  maskRect
}: MaskedTextProps) => {
  const { getFontName } = useFonts()
  const safeFontFamily = getFontName(fontFamily, 'system')
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        <Defs>
          {maskRect && (
            <Mask id="textMask">
              <Rect
                x={maskRect.x}
                y={maskRect.y}
                width={maskRect.width}
                height={maskRect.height}
                fill="white"
              />
            </Mask>
          )}
        </Defs>
        
        {/* Отладочный контур маски */}
        {debug && maskRect && (
          <Rect
            x={maskRect.x}
            y={maskRect.y}
            width={maskRect.width}
            height={maskRect.height}
            fill="none"
            stroke="orange"
            strokeWidth="2"
          />
        )}
        
        <SvgText 
          x={x}
          y={y}
          fontSize={fontSize} 
          fill={fill} 
          fontWeight={fontWeight} 
          letterSpacing={letterSpacing}
          textAnchor={textAlign}
          fontFamily={safeFontFamily}
          mask={maskRect ? "url(#textMask)" : undefined}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  )
}


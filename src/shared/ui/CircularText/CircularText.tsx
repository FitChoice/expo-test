import React from 'react'
import { View } from 'react-native'
import Svg, { Defs, Path, Text, TextPath, Mask, Rect } from 'react-native-svg'

interface CircularTextProps {
	text: string
	width?: number
	height?: number
	centerX?: number
	centerY?: number
	fontSize?: number
	fill?: string
	startOffset?: string
	fontWeight?: string
	letterSpacing?: string
	rotation?: number
	debug?: boolean
	maskRect?: {
		x: number
		y: number
		width: number
		height: number
	}
}

/**
 * Компонент для отображения текста по кругу
 */
export const CircularText = ({
	text,
	width = 269.1,
	height = 135.97,
	centerX = 200,
	centerY = 200,
	fontSize = 15,
	fill = '#FFFFFF',
	startOffset = '0%',
	fontWeight = '300',
	letterSpacing = '-3%',
	rotation = 0,
	debug = false,
	maskRect,
}: CircularTextProps) => {
	// Создаем путь для овала
	const rx = width / 2
	const ry = height / 2
	const ellipsePath = `M ${centerX - rx},${centerY} A ${rx},${ry} 0 1,1 ${centerX + rx},${centerY} A ${rx},${ry} 0 1,1 ${centerX - rx},${centerY}`

	// Вычисляем размер SVG с запасом, чтобы окружность не обрезалась
	const svgWidth = Math.max(centerX + rx + 20, width + 40)
	const svgHeight = Math.max(centerY + ry + 20, height + 40)

	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
			<Svg width={svgWidth} height={svgHeight}>
				<Defs>
					<Path id="ellipse" d={ellipsePath} />
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
						stroke="red"
						strokeWidth="2"
					/>
				)}

				<Text
					fontSize={fontSize}
					fill={fill}
					fontWeight={fontWeight}
					letterSpacing={letterSpacing}
					transform={`rotate(${rotation} ${centerX} ${centerY})`}
					mask={maskRect ? 'url(#textMask)' : undefined}
				>
					<TextPath href="#ellipse" startOffset={startOffset}>
						{text}
					</TextPath>
				</Text>
			</Svg>
		</View>
	)
}

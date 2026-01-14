import React, { forwardRef, useState, useMemo } from 'react'
import { View, TextInput, Text, TouchableOpacity, Pressable, Image } from 'react-native'
import { type InputProps } from './types'
import { SimpleIcon } from '../Icon/SimpleIcon'
import { Icon } from '../Icon/Icon'

// Универсальный Input компонент
// Варианты: text, password, dropdown, textarea
export const Input = forwardRef<TextInput, InputProps>(
	(
		{
			variant = 'text',
			size = 'default',
			label,
			error,
			helperText,
			forceHelperText = false,
			leftIcon,
			rightIcon,
			leftImage,
			forgotPassword = false,
			onForgotPassword,
			showTooltip = false,
			disabled = false,
			dropdownOptions,
			onDropdownSelect,
			containerStyle,
			className: _className = '',
			inputClassName: _inputClassName = '',
			labelClassName: _labelClassName = '',
			value,
			placeholder = 'Example',
			onFocus,
			onBlur,
			...rest
		},
		ref
	) => {
		const [passwordVisible, setPasswordVisible] = useState(false)
		const [dropdownOpen, setDropdownOpen] = useState(false)
		const [isFocused, setIsFocused] = useState(false)

		const filled = !!value
		const hasError = !!error

		const handleChangeText = (text: string) => {
			rest.onChangeText?.(text)
		}

		// Memoized styles based on state
		const containerClassNames = useMemo(() => {
			const baseClasses = [
				'flex-row items-center bg-fill-800',
				size === 'settings' ? 'rounded-lg px-2 py-2' : 'rounded-2xl px-4 py-5',
			]

			if (disabled) {
				baseClasses.push('opacity-50')
			}

			if (hasError) {
				baseClasses.push('border border-feedback-negative-900')
			} else if (isFocused) {
				baseClasses.push('border border-[#BA9BF7]')
			}

			return baseClasses.join(' ')
		}, [size, disabled, hasError, isFocused])

		const textColor = useMemo(() => {
			if (disabled) return '#949494'
			if (filled) return '#FFFFFF'
			return '#949494'
		}, [disabled, filled])

		const iconColor = useMemo(() => {
			return disabled ? '#949494' : '#FFFFFF'
		}, [disabled])

		const handleTogglePassword = () => {
			setPasswordVisible(!passwordVisible)
		}

		const handleDropdownToggle = () => {
			if (!disabled) {
				setDropdownOpen(!dropdownOpen)
			}
		}

		const renderIcon = (icon: React.ReactNode) => {
			if (!icon) return null

			if (React.isValidElement(icon)) {
				return React.cloneElement(icon, {
					size: 16,
					color: iconColor,
				} as {
					size: number
					color: string
				})
			}

			return <SimpleIcon name={String(icon)} size={16} color={iconColor} />
		}

		const renderInput = () => {
			// Textarea variant
			if (variant === 'textarea') {
				return (
					<View className={`${containerClassNames} min-h-[112px]`}>
						<TextInput
							ref={ref}
							{...rest}
							value={value}
							placeholder={placeholder}
							placeholderTextColor="#C1C1C1"
							multiline
							numberOfLines={4}
							editable={!disabled}
							onFocus={(e) => {
								setIsFocused(true)
								onFocus?.(e)
							}}
							onBlur={(e) => {
								setIsFocused(false)
								onBlur?.(e)
							}}
							onChangeText={rest.onChangeText}
							autoCapitalize="sentences"
							autoCorrect={true}
							returnKeyType="default"
							blurOnSubmit={false}
							textAlignVertical="top"
							className="min-h-[80px] flex-1 font-[Onest] text-sm"
							style={{ color: textColor }}
						/>
						<Text className="mt-2 self-end text-xs text-light-text-200">
							{value?.length || 0} / 500 символов
						</Text>
					</View>
				)
			}

			// Dropdown variant
			if (variant === 'dropdown') {
				return (
					<TouchableOpacity
						className={`${containerClassNames} justify-between`}
						onPress={handleDropdownToggle}
						disabled={disabled}
					>
						<View className="flex-row items-center gap-2">
							{leftImage && (
								<Image source={leftImage} className="h-5 w-5" resizeMode="contain" />
							)}
							{leftIcon && !leftImage && renderIcon(leftIcon)}
							<Text className="text-sm" style={{ color: filled ? '#FFFFFF' : '#C1C1C1' }}>
								{value || placeholder}
							</Text>
						</View>
						<SimpleIcon
							name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
							size={16}
							color={iconColor}
						/>
					</TouchableOpacity>
				)
			}

			// Text and Password variants
			const isPassword = variant === 'password'
			const showPasswordToggle = isPassword
			const shouldHidePassword = isPassword && !passwordVisible

			return (
				<View className={containerClassNames}>
					{leftImage && (
						<View className="mr-2">
							<Image source={leftImage} className="h-5 w-5" resizeMode="contain" />
						</View>
					)}
					{leftIcon && !leftImage && <View className="mr-2">{renderIcon(leftIcon)}</View>}

					<TextInput
						ref={ref}
						{...rest}
						value={value}
						placeholder={placeholder}
						placeholderTextColor="#8F8F92"
						editable={!disabled}
						onFocus={(e) => {
							setIsFocused(true)
							onFocus?.(e)
						}}
						onBlur={(e) => {
							setIsFocused(false)
							onBlur?.(e)
						}}
						onChangeText={rest.onChangeText || handleChangeText}
						keyboardType={rest.keyboardType || 'default'}
						secureTextEntry={shouldHidePassword}
						className="flex-1 font-[Onest] text-sm"
						style={{ color: textColor }}
					/>

					{showPasswordToggle && (
						<Pressable
							onPress={handleTogglePassword}
							className="ml-2 min-w-[32px] items-center justify-center rounded bg-transparent p-2"
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon
								name={passwordVisible ? 'eye' : 'eye-slash'}
								size={16}
								color="#FFFFFF"
							/>
						</Pressable>
					)}

					{rightIcon && !showPasswordToggle && (
						<View className="ml-2">{renderIcon(rightIcon)}</View>
					)}
				</View>
			)
		}

		return (
			<View className="flex-col" style={containerStyle}>
				{/* Label with optional tooltip */}
				{label && (
					<View className="mb-3 flex-row items-center gap-1">
						<Text   className="font-inter text-light-text-200">{label}</Text>
						{showTooltip && <SimpleIcon name="info" size={16} color="#FFFFFF" />}
					</View>
				)}

				{/* Input field */}
				{renderInput()}

				{/* Error message or Helper text */}
				{error && (
					<Text className="mt-2 text-xs text-feedback-negative-900">{error}</Text>
				)}

				{helperText && (!error || forceHelperText) && (
					<Text className="mt-2 text-xs text-white">{helperText}</Text>
				)}

				{/* Forgot password link */}
				{variant === 'password' && forgotPassword && (
					<TouchableOpacity onPress={onForgotPassword} className="mt-2 self-end">
						<Text className="text-xs text-light-text-200">Забыли пароль?</Text>
					</TouchableOpacity>
				)}

				{/* Dropdown options */}
				{variant === 'dropdown' && dropdownOpen && dropdownOptions && (
					<View className="mt-2 overflow-hidden rounded-lg bg-fill-800">
						{dropdownOptions.map((option) => (
							<Pressable
								key={option.value}
								className="px-4 py-3"
								onPress={() => {
									onDropdownSelect?.(option.value)
									setDropdownOpen(false)
								}}
							>
								<Text className="text-sm text-white">{option.label}</Text>
							</Pressable>
						))}
					</View>
				)}
			</View>
		)
	}
)

Input.displayName = 'Input'

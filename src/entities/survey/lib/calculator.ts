/**
 * BMI calculation business logic
 */

/**
 * Calculate BMI from height (cm) and weight (kg)
 */
export function calculateBMI(height: number, weight: number): number {
	const heightInMeters = height / 100
	const bmi = weight / (heightInMeters * heightInMeters)
	return parseFloat(bmi.toFixed(1))
}

/**
 * BMI category result
 */
export interface BMICategory {
	bmi: number
	description: string
}

/**
 * Get BMI category and description
 */
export function getBMICategory(bmi: number | null): BMICategory | null {
	if (!bmi) return null

	if (bmi < 16.9) {
		return {
			bmi,
			description:
				'Это недостаточный вес, поэтому мы обратим внимание на питание и укрепление мышц',
		}
	} else if (bmi >= 17 && bmi < 18.5) {
		return {
			bmi,
			description:
				'Это слегка пониженный вес, тренировки помогут добавить силы и энергии',
		}
	} else if (bmi >= 18.5 && bmi < 25) {
		return {
			bmi,
			description:
				'Это нормальный вес для вашего роста. Отличная база, чтобы развивать тело и достигать новых целей',
		}
	} else if (bmi >= 30 && bmi < 35) {
		return {
			bmi,
			description:
				'Это избыточный вес, сосредоточимся на тренировки возвращении легкости и улучшении самочувствия',
		}
	} else if (bmi >= 35 && bmi < 40) {
		return {
			bmi,
			description:
				'Это ожирение второй степени. Мы будем идти маленькими шагами, чтобы укреплять тело без перегрузок',
		}
	} else {
		return {
			bmi,
			description:
				'Это ожирение третьей степени. Даже небольшая активность и регулярность принесут заметный результат для здоровья',
		}
	}
}

export const trainingKeys = {
	all: ['training'] as const,
	plans: () => [...trainingKeys.all, 'plan'] as const,
	plan: (userId: number) => [...trainingKeys.plans(), userId] as const,
	reports: () => [...trainingKeys.all, 'report'] as const,
	report: (trainingId: number) => [...trainingKeys.reports(), trainingId] as const,
	details: () => [...trainingKeys.all, 'detail'] as const,
	detail: (trainingId: number) => [...trainingKeys.details(), trainingId] as const,
	exercises: () => [...trainingKeys.all, 'exercise'] as const,
	exercise: (trainingId: string | number, exerciseId: number) =>
		[...trainingKeys.exercises(), trainingId, exerciseId] as const,
}

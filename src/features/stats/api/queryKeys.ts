export const statsKeys = {
	all: ['stats'] as const,
	calendar: (userId: string | number) => [...statsKeys.all, 'calendar', userId] as const,
	diaries: (userId: string | number) => [...statsKeys.all, 'diaries', userId] as const,
	trainings: (userId: string | number, kind?: string) =>
		[...statsKeys.all, 'trainings', userId, kind] as const,
	dayDetails: (scheduleId: string | number) =>
		[...statsKeys.all, 'day', scheduleId] as const,
	mainStats: (userId: string | number) =>
		[...statsKeys.all, 'main', userId] as const,
	bodyStats: (userId: string | number) => [...statsKeys.all, 'body', userId] as const,
	chart: (userId: string | number, kind: string, period?: string, date?: string) =>
		[...statsKeys.all, 'chart', userId, kind, period, date] as const,
}

export const progressKeys = {
	all: ['progress'] as const,
	list: (userId: string) => [...progressKeys.all, 'list', userId] as const,
}


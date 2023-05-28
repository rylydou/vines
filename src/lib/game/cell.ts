export const cells: (CellDefinition | undefined)[] = [
	{
		id: 'air',
		name: 'Air',
		validate: () => true,
	}
]

export interface CellDefinition {
	id: string
	name: string
	validate: () => boolean
}

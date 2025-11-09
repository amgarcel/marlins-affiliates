import { useQuery } from '@tanstack/react-query'

export function sportIdToLevel(id?: number): string {
	if (id == null) return ''
	switch (id) {
		case 1:
			return 'MLB'
		case 11:
			return 'AAA'
		case 12:
			return 'AA'
		case 13:
			return 'High-A'
		case 14:
			return 'A'
		case 16:
			return 'Rookie'
		case 21:
			return 'DSL'
		default:
			return ''
	}
}

type TeamInfo = {
	name: string
	sportId?: number
	parent?: string
}

export function useTeamInfo(teamId?: number) {
	return useQuery<TeamInfo>({
		enabled: typeof teamId === 'number' && teamId > 0,
		queryKey: ['team', teamId ?? null],
		queryFn: async ({ signal }) => {
			const r = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}`, { signal })
			const d = await r.json()
			const t = d?.teams?.[0]
			return {
				name: t?.name as string,
				sportId: t?.sport?.id as number | undefined,
				parent: t?.parentOrgName as string | undefined,
			}
		},
		staleTime: 60_000,
	})
}



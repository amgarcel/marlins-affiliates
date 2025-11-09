import { useQuery } from '@tanstack/react-query'
import type { Linescore } from '../types'

export function useLinescore(gamePk?: number) {
	return useQuery<Linescore>({
		enabled: !!gamePk,
		queryKey: ['linescore', gamePk],
		queryFn: async ({ signal }) => {
			const r = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`, { signal, cache: 'no-store' })
			return r.json()
		},
		staleTime: 15_000,
	})
}



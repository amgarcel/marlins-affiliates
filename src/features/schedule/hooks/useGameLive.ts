import { useQuery } from '@tanstack/react-query'
import type { Decisions } from '../types'

export function useGameLive(gamePk?: number) {
	return useQuery<{
		decisions?: Decisions
		offense?: {
			batterName?: string
			pitcherName?: string
			onFirst?: boolean
			onSecond?: boolean
			onThird?: boolean
		}
	}>({
		enabled: !!gamePk,
		queryKey: ['game-live', gamePk],
		queryFn: async ({ signal }) => {
			async function fetchFeed(): Promise<any | undefined> {
				try {
					const r11 = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`, { signal, cache: 'no-store' })
					if (r11.ok) return r11.json()
				} catch {}
				try {
					const r1 = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/live`, { signal, cache: 'no-store' })
					if (r1.ok) return r1.json()
				} catch {}
				return undefined
			}
			const d = await fetchFeed()
			const offense = d?.liveData?.linescore?.offense
			return {
				decisions: d?.liveData?.decisions,
				offense: {
					batterName: offense?.batter?.fullName as string | undefined,
					pitcherName: offense?.pitcher?.fullName as string | undefined,
					onFirst: Boolean(offense?.first),
					onSecond: Boolean(offense?.second),
					onThird: Boolean(offense?.third),
				},
			}
		},
		staleTime: 30_000,
	})
}

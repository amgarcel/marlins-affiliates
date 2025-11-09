import { useQuery } from "@tanstack/react-query"
import { TEAM_IDS, SPORT_IDS } from "../constants"
import type { ScheduleGame } from "../types"

async function fetchSchedule(date: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ date })
  TEAM_IDS.forEach(id => params.append('teamId', String(id)))
  SPORT_IDS.forEach(id => params.append('sportId', String(id)))
  const url = new URL('https://statsapi.mlb.com/api/v1/schedule')
  url.search = params.toString()
  const response = await fetch(url.toString(), {
    signal,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch schedule')
  }
  return response.json()
}

type ScheduleResponse = {
  dates?: Array<{
    games?: ScheduleGame[]
  }>
}

export function useSchedule(date: string) {
  return useQuery<ScheduleResponse>({
    queryKey: ['schedule', { date }],
    queryFn: ({ signal }) => fetchSchedule(date, signal),
    staleTime: 60_000,
    refetchOnWindowFocus: true
  })
}
import { useSchedule } from './features/schedule/hooks/useSchedule'
import { TEAM_IDS } from './features/schedule/constants'
import { useTeamInfo, sportIdToLevel } from './features/schedule/hooks/useTeamInfo'
import { useGameLive } from './features/schedule/hooks/useGameLive'
import { useLinescore } from './features/schedule/hooks/useLinescore'
import { useMemo, useState } from 'react'
import type { ScheduleGame, GameState, Decisions } from './features/schedule/types'

function App() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const { data, isLoading, error, isFetching, refetch } = useSchedule(date)

  const games: ScheduleGame[] = data?.dates?.[0]?.games ?? []

  const gamesByTeamId = useMemo(() => {
    const map = new Map<number, ScheduleGame>()
    for (const g of games) {
      const homeId = g?.teams?.home?.team?.id
      const awayId = g?.teams?.away?.team?.id
      if (homeId) map.set(homeId, g)
      if (awayId) map.set(awayId, g)
    }
    return map
  }, [games])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/images.png" alt="Marlins" className="h-7 w-7 rounded-sm" />
          <h1 className="text-xl font-semibold">Marlins Affiliates Schedule</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded border text-slate-700 hover:bg-slate-50"
            onClick={() => {
              const d = new Date(date)
              d.setDate(d.getDate() - 1)
              setDate(d.toISOString().split('T')[0])
            }}
            aria-label="Previous day"
          >
            ◀
          </button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="px-2 py-1 rounded border text-slate-700 hover:bg-slate-50"
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </button>
          <button
            className="px-2 py-1 rounded border text-slate-700 hover:bg-slate-50"
            onClick={() => {
              const d = new Date(date)
              d.setDate(d.getDate() + 1)
              setDate(d.toISOString().split('T')[0])
            }}
            aria-label="Next day"
          >
            ▶
          </button>
          <button
            className={`ml-2 px-3 py-1 rounded border text-slate-700 bg-slate-100 hover:bg-slate-200 inline-flex items-center gap-2 ${isFetching ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <span className={`${isFetching ? 'animate-spin' : ''}`} aria-hidden>↻</span>
            <span>{isFetching ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded p-3 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_IDS.map((id) => {
          const game = gamesByTeamId.get(id)
          return <TeamTile key={id} teamId={id} game={game} />
        })}
      </div>
    </div>
  )
}

function LevelBadge({ sportId }: { sportId?: number }) {
  if (!sportId) return null
  const label = sportIdToLevel(sportId)
  if (!label) return null
  return (
    <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
      {label}
    </span>
  )
}

function StateBadge({ state }: { state?: GameState }) {
  if (!state) return null
  const base = 'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full'
  if (state === 'Live') {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
        Live
      </span>
    )
  }
  if (state === 'Preview') {
    return <span className={`${base} bg-sky-100 text-sky-700`}>Preview</span>
  }
  return <span className={`${base} bg-emerald-100 text-emerald-700`}>Final</span>
}

function HomeAwayBadge({ isHome }: { isHome: boolean }) {
  const base = 'ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200'
  return <span className={base}>{isHome ? 'Home' : 'Away'}</span>
}

function TeamTile({ teamId, game }: { teamId: number; game?: ScheduleGame }) {
  const { data } = useTeamInfo(teamId)
  const title = data?.name ?? `Team ${teamId}`

  const isHome = game?.teams?.home?.team?.id === teamId
  const opponent = isHome ? game?.teams?.away : game?.teams?.home
  const opponentId = opponent?.team?.id as number | undefined
  const opponentName = opponent?.team?.name as string | undefined
  const { data: oppInfo } = useTeamInfo(opponentId)
  const parentClub = oppInfo?.sportId !== 1 ? oppInfo?.parent : undefined
  const venue = game?.venue?.name as string | undefined
  const state: GameState | undefined = game?.status?.abstractGameState
  const gameDate = game?.gameDate
  const dt = gameDate ? new Date(gameDate) : undefined
  const timeLocal = dt && !isNaN(dt.getTime()) ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined

  const { data: live } = useGameLive(game?.gamePk as number | undefined)
  const { data: linescore } = useLinescore(state === 'Live' ? (game?.gamePk as number) : undefined)
  const decisions: Decisions | undefined = (live?.decisions ?? (game as any)?.decisions)

  return (
    <div className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition ${state === 'Live' ? 'border-red-300' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium flex items-center">
          <span>{title}</span>
          <LevelBadge sportId={data?.sportId} />
        </div>
        <StateBadge state={state} />
      </div>
      <div className="text-sm">
        {!game && <div className="text-slate-500">NO GAME</div>}
        {game && (
          <>
            <div className="mb-1">
              <span className="font-medium">{isHome ? 'vs' : '@'} {opponentName}</span>
              <span className="text-slate-500">{parentClub ? ` (${parentClub})` : ''}</span>
              <HomeAwayBadge isHome={isHome ?? false} />
            </div>
            {state === 'Preview' && (
              <>
                <div className="text-slate-700">{[timeLocal ? `Time: ${timeLocal}` : undefined, venue ? `Venue: ${venue}` : undefined].filter(Boolean).join(' · ')}</div>
                <div className="text-slate-600 mt-1">
                  Probables:{' '}
                  {(game?.teams?.home?.probablePitcher?.fullName as string | undefined) ?? '-'} vs{' '}
                  {(game?.teams?.away?.probablePitcher?.fullName as string | undefined) ?? '-'}
                </div>
              </>
            )}
            {state === 'Final' && (
              <>
                <div className="flex items-center gap-2">
                  <span>{game?.teams?.away?.team?.name}</span>
                  <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-1">
                    {game?.teams?.away?.score ?? '-'}
                  </span>
                  <span className="mx-1">—</span>
                  <span>{game?.teams?.home?.team?.name}</span>
                  <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-1">
                    {game?.teams?.home?.score ?? '-'}
                  </span>
                </div>
                {(decisions?.winner?.fullName ||
                  decisions?.loser?.fullName ||
                  decisions?.save?.fullName) && (
                  <div className="text-slate-600">
                    <>
                      {decisions?.winner?.fullName && (
                        <span title="Winning pitcher">W: {decisions.winner.fullName}</span>
                      )}
                      {decisions?.winner?.fullName && decisions?.loser?.fullName && <span> · </span>}
                      {decisions?.loser?.fullName && (
                        <span title="Losing pitcher">L: {decisions.loser.fullName}</span>
                      )}
                      {decisions?.save?.fullName && (decisions?.winner?.fullName || decisions?.loser?.fullName) && <span> · </span>}
                      {decisions?.save?.fullName && (
                        <span title="Save">S: {decisions.save.fullName}</span>
                      )}
                    </>
                  </div>
                )}
                {venue && <div className="text-slate-600">Venue: {venue}</div>}
              </>
            )}
            {state === 'Live' && (
              <>
                <div>
                  {linescore?.currentInningOrdinal ?? '-'} {linescore?.inningHalf ?? ''} · {linescore?.outs ?? 0} outs
                </div>
                <div className="flex items-center gap-2">
                  <span>{game?.teams?.away?.team?.name}</span>
                  <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-1">
                    {linescore?.teams?.away?.runs ?? '-'}
                  </span>
                  <span className="mx-1">—</span>
                  <span>{game?.teams?.home?.team?.name}</span>
                  <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-1">
                    {linescore?.teams?.home?.runs ?? '-'}
                  </span>
                </div>
                <div className="text-slate-600">B {linescore?.balls ?? 0} · S {linescore?.strikes ?? 0} · O {linescore?.outs ?? 0}</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${live?.offense?.onFirst ? 'bg-amber-400 border-amber-500' : 'bg-slate-200 border-slate-300'}`} title="1B" />
                    <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${live?.offense?.onSecond ? 'bg-amber-400 border-amber-500' : 'bg-slate-200 border-slate-300'}`} title="2B" />
                    <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${live?.offense?.onThird ? 'bg-amber-400 border-amber-500' : 'bg-slate-200 border-slate-300'}`} title="3B" />
                  </div>
                  <div className="text-slate-600 text-xs">(runners on base)</div>
                </div>
                <div className="text-slate-700 mt-1">
                  At Bat: {live?.offense?.batterName ?? '-'} · Pitching: {live?.offense?.pitcherName ?? '-'}
                </div>
                <div className="text-slate-600">Venue: {venue}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App

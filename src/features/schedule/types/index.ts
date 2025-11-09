

export type GameState = 'Preview' | 'Live' | 'Final'

export interface TeamRef {
	id: number
	name: string
	link?: string
}

export interface SideInfo {
	team: TeamRef
	score?: number
	probablePitcher?: { fullName?: string }
}

export interface GameTeams {
	home: SideInfo
	away: SideInfo
}

export interface GameStatus {
	abstractGameState: GameState
	detailedState?: string
}

export interface ScheduleGame {
	gamePk: number
	gameType?: string // 'S' | 'R' | 'P' | ...
	gameDate: string
	status: GameStatus
	teams: GameTeams
	venue?: { name?: string }
}

export interface Decisions {
	winner?: { fullName?: string }
	loser?: { fullName?: string }
	save?: { fullName?: string }
}

export interface Linescore {
	currentInningOrdinal?: string
	inningHalf?: string
	outs?: number
	teams?: {
		home?: { runs?: number }
		away?: { runs?: number }
	}
	balls?: number
	strikes?: number
}



export interface User {
  id: string; username: string; mcUsername: string; mcVerified: boolean
  passwordHash: string; salt: string; balance: number; createdAt: string
  lastLogin: string; totalWon: number; totalLost: number; gamesPlayed: number
  stockPortfolio: number
}
export interface Session { userId: string; token: string; expiresAt: number }
export interface LiveEvent {
  id: string; username: string; game: string; amount: number
  won: boolean; multiplier?: number; timestamp: number
}
export interface LobbyRoom {
  id: string; game: 'coinflip'|'dice'; hostId: string; hostName: string
  guestId: string|null; guestName: string|null; bet: number
  status: 'waiting'|'playing'|'done'; result?: RoomResult; createdAt: number
}
export interface RoomResult {
  winnerId: string; winnerName: string; hostRoll?: number; guestRoll?: number
  flip?: string; hostSide?: string; guestSide?: string; payout: number
}
export interface BridgeConfig { backendUrl: string; apiKey: string; enabled: boolean }
export interface StockPoint { time: number; price: number }

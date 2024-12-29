export interface Book {
  id: string
  title: string
  author: string
  cover_url?: string
  added_at: string
}


export type BackgroundType =  'pattern' | 'pixels' | 'minecraft' | 'ai-coin' | 'saturn' | 'scene3d-war' | 'racing' | 'particles' | 'waves' | 'heartbeat' | 'space-pikachu' | 'fantasy' | 'cyber-world'

export interface Video {
  id: string
  user_id: string
  title: string
  url: string
  provider: 'youtube' | 'instagram' | 'tiktok'
  thumbnail_url?: string
  meta?: {
    duration?: string
    views?: number
    likes?: number
    isReel?: boolean
    [key: string]: string | number | boolean | undefined
  }
  added_at: string
}
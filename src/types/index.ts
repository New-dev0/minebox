import { Book } from "../types"

export type BackgroundType = 
  | 'saturn' 
  | 'scene3d-war' 
  | 'pattern' 
  | 'particles' 
  | 'waves' 
  | 'pixels'
  | 'heartbeat'
  | 'racing'
  | 'scene3d'
  | 'minecraft'
  | 'ai-coin'

export interface Pattern {
  id: string
  name: string
  css: {
    backgroundColor: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
  }
  intensity?: {
    min: number
    max: number
    default: number
    unit: string
  }
}

export interface ColorScheme {
  id: string
  name: string
  colors: {
    primary: string
    background: string
  }
  preview: {
    gradient: string
  }
}

export interface ThemeState {
  backgroundType: BackgroundType
  pattern: Pattern | null
  patternIntensity: number
  colorScheme: ColorScheme | null
  customColors: {
    primary: string
    background: string
  }
}

export interface QuoteContent {
  quote: string
  author: string
}

export interface BlogContent {
  id: string
  title: string
  cover_image: string
  preview: string
  tags: string[]
  created_at: string
}

export interface TimelineEvent {
  id: string
  type: 'moment' | 'achievement' | 'milestone' | 'quote' | 'blog'
  title: string
  content: string | QuoteContent | BlogContent
  created_at: string
  event_date?: string,
  metadata?: {
    color?: string
  }
}

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  awarded_at: string
  metadata?: {
    rarity?: string
    points?: number
    color?: string
  }
}

export interface ProfileData {
  id: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  show_bookshelf: boolean
  favorite_books?: Book[]
  theme: ThemeState | null
  setup_completed: boolean
  stats?: {
    posts: number
    friends: number
    achievements: number
  }
  avatar_shape: string
  show_social_links: boolean
  timeline_events?: TimelineEvent[]
  achievements?: Achievement[]
  social_links?: Array<{
    id: string
    platform: string
    url: string
    label?: string
  }>
} 
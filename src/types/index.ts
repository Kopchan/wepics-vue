import type { Component } from 'vue'

export interface SortType {
  name: string
  value: string
  reverse: boolean | null
  icon: Component
}

export type RatingPreset = 'hide' | 'blur'

export interface AgeRating {
  id: string | number
  code: string
  name?: string
  color?: string
  description?: string
  preset?: RatingPreset
  globalPreset?: RatingPreset
  devicePreset?: RatingPreset
  settedPreset?: RatingPreset | 'inherit'
  [key: string]: unknown
}

// Пункт для BtnRadios/SelectorRadios/SelectorRadios2
export interface SelectorOption {
  name?: string
  value?: unknown
  icon?: Component
  color?: string
  disabled?: boolean
}

export interface ReactionState {
  isYouSet: boolean
  count: number
}

export type Reactions = Record<string, ReactionState>

export interface AlbumItem {
  hash: string
  alias?: string
  name?: string
  sign?: string
  path?: string
  oldAliases?: string[]
  ratingId?: number
  ancestors?: AlbumItem[]
  children?: AlbumItem[]
  size?: number
  duration?: number
  imagesCount?: number
  videosCount?: number
  audiosCount?: number
  mediasCount?: number
  albumsCount?: number
  nestedImagesCount?: number | null
  orderLevel?: number | string
  guestAllow?: boolean
  indexedAt?: string
  contentSort?: string | number
  contentSortField?: string | null
  images?: ImageItem[]
  // Клиентские UI-состояния, добавляемые во время работы с деревом альбомов
  vueExpanded?: boolean
  vueLoading?: boolean
  vueLoadErr?: unknown
  data?: AlbumItem
  [key: string]: unknown
}

export interface ImageItem {
  hash: string
  name?: string
  type?: 'image'|'video'|'audio'|'imageAnimated'
  ratio?: number
  width?: number
  height?: number
  size?: number
  date?: string
  duration?: number
  bitrate?: number
  ext?: string
  watchedTo?: number
  ratingId?: number
  album?: AlbumItem
  reactions?: Reactions
  // Клиентские UI-состояния, добавляемые во время работы cо стеной медиа
  thumbURL?: string
  thumbURLanim?: string
  thumbURLorig?: string
  [key: string]: unknown
}

export interface AuthUser {
  token?: string
  isAdmin?: boolean
  nickname?: string
  [key: string]: unknown
}

import { API_PATH } from "@/config"

export interface AlbumInfoParams {
  noChildren?: boolean
  sort?: string | null
  sortAlbums?: string | null
  images?: number
  isReverse?: boolean
  isReverseAlbums?: boolean
  disrespect?: boolean
  nested?: boolean
  seed?: string | number | boolean | null
  types?: string[]
  ratings?: (string | number)[]
  tags?: string[]
}

export interface AlbumImagesParams {
  page?: number
  limit?: number
  sort?: string
  isReverse?: boolean
  nested?: boolean
  seed?: string | number | boolean | null
  types?: string[]
  ratings?: (string | number)[]
  tags?: string[]
}

export const urls = {
  root: (): string => API_PATH,

  setups: (): string => API_PATH + '/setups',

  authSignUp: (): string => API_PATH + '/users/reg',
  authLogIn : (): string => API_PATH + '/users/login',
  authLogOut: (): string => API_PATH + '/users/logout',

  reactions: (): string => API_PATH + '/reactions',

  users: (): string => API_PATH + '/users',

  album: (albumHash: string): string => API_PATH + '/albums/' + albumHash,
  albumInfo: (albumHash: string, {
    noChildren      = false,
    sort            = null,
    sortAlbums      = null,
    images          = 0,
    isReverse       = false,
    isReverseAlbums = false,
    disrespect      = false,
    seed            = null,
    types           = [],
    ratings         = [],
    tags            = [],
  }: AlbumInfoParams = {}): string =>
    API_PATH + '/albums/' + albumHash + '/info?'
    + (images           ? 'images=' + images  : 'images=0')
    + (noChildren       ? '&simple'                   : '')
    + (sort             ? '&sort=' + sort             : '')
    + (isReverse        ? '&reverse'                  : '')
    + (sortAlbums       ? '&sortAlbums=' + sortAlbums : '')
    + (isReverseAlbums  ? '&reverseAlbums'            : '')
    + (disrespect       ? '&disrespect'               : '')
    + (seed && seed !== true? '&seed=' + seed : '')
    + (types   ?.length ? '&types='  + types  .map(e => encodeURIComponent(e))?.join(',') : '')
    + (ratings ?.length ? '&rating=' + ratings.map(e => encodeURIComponent(String(e)))?.join(',') : '')
    + (tags    ?.length ? '&tags='   + tags   .map(e => encodeURIComponent(e))?.join(',') : '')
  ,
  albumReindex  : (albumHash: string): string => API_PATH + '/albums/' + albumHash + '/reindex',
  albumAccesses : (albumHash: string): string => API_PATH + '/albums/' + albumHash + '/access',
  albumImages   : (albumHash: string, {
    page      = 1,
    limit     = 30,
    sort      = 'name',
    isReverse = false,
    nested    = false,
    seed      = null,
    types     = [],
    ratings   = [],
    tags      = [],
  }: AlbumImagesParams = {}): string => API_PATH
    + '/albums/' + albumHash
    + '/images?page=' + page
    + '&limit=' +      limit
    + '&sort=' +        sort
    + (isReverse        ? '&reverse' : '')
    + (nested           ? '&nested'  : '')
    + (seed && seed !== true? '&seed='    + seed : '')
    + (types   ?.length ? '&types='   + types  .map(e => encodeURIComponent(e))?.join(',') : '')
    + (ratings ?.length ? '&ratings=' + ratings.map(e => encodeURIComponent(String(e)))?.join(',') : '')
    + (tags    ?.length ? '&tags='    + tags   .map(e => encodeURIComponent(e))?.join(',') : '')
  ,
  imageReaction : (albumHash: string, imageHash: string, reaction: string): string =>
    API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/reactions?reaction=' + reaction,
  imageOrig     : (albumHash: string, imageHash: string, sign: string | null = null): string =>
    API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/orig'     + (sign ? '?sign='+ sign : ''),
  imageDownload : (albumHash: string, imageHash: string, sign: string | null = null): string =>
    API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/download' + (sign ? '?sign='+ sign : ''),
  imageThumb    : (
    albumHash: string,
    imageHash: string,
    sign: string | null = null,
    orientation: string = 'h',
    size: number = 480,
    animated: boolean = false,
  ): string => API_PATH
    + '/albums/' + albumHash
    + '/images/' + imageHash
    + '/thumb/'
    + orientation + size + (animated ? 'a' : '')
    + (sign ? '?sign='+ sign : '')
  ,
}

export default urls
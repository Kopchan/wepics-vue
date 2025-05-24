import { API_PATH } from "@/config"

export const urls = {
  root: () => API_PATH,

  setups: () => API_PATH + '/setups',

  authSignUp: () => API_PATH + '/users/reg',
  authLogIn : () => API_PATH + '/users/login',
  authLogOut: () => API_PATH + '/users/logout',

  reactions: () => API_PATH + '/reactions',

  users: () => API_PATH + '/users',

  album: (albumHash) => API_PATH + '/albums/' + albumHash,
  albumInfo: (albumHash, {
    noChildren = false, 
    sort       = null, 
    sortAlbums = null, 
    images = 0, 
    isReverse       = false,
    isReverseAlbums = false,
    disrespect = false,
    rating = [],
    tags   = [],
  } = {}) => 
    API_PATH + '/albums/' + albumHash + '/info?' 
    + (images           ? 'images=' + images : 'images=0') 
    + (noChildren       ? '&simple' : '')
    + (sort             ? '&sort=' + sort : '')
    + (isReverse        ? '&reverse' : '')
    + (sortAlbums       ? '&sortAlbums=' + sortAlbums : '') 
    + (isReverseAlbums  ? '&reverseAlbums' : '')
    + (disrespect       ? '&disrespect' : '')
    + (rating?.length   ? '&rating=' + rating.map(elem => encodeURIComponent(elem))?.join(',') : '')
    + (tags?.length     ? '&tags='   + tags  .map(elem => encodeURIComponent(elem))?.join(',') : '')
  ,
  albumReindex  : (albumHash) => API_PATH + '/albums/' + albumHash + '/reindex',
  albumAccesses : (albumHash) => API_PATH + '/albums/' + albumHash + '/access',
  albumImages   : (albumHash, {page = 1, limit = 30, sort = 'name', tags = [], isReverse = false, nested = false} = {}) => 
    API_PATH +
    '/albums/' + albumHash +
    '/images?page=' + page +
    '&limit=' +      limit +
    '&sort=' +        sort +
    (tags?.length ? '&tags=' + tags.map(elem => encodeURIComponent(elem))?.join(',') : '') +
    (isReverse ? '&reverse' : '') +
    (nested ? '&nested' + (nested == 'force' ? '=force' : '') : '')
  ,
  imageReaction : (albumHash, imageHash, reaction)    => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/reactions?reaction=' + reaction,
  imageOrig     : (albumHash, imageHash, sign = null) => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/orig'     + (sign ? '?sign='+ sign : ''),
  imageDownload : (albumHash, imageHash, sign = null) => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/download' + (sign ? '?sign='+ sign : ''),
  imageThumb    : (albumHash, imageHash, sign = null, orientation = 'h', size = 480, animated = false) => API_PATH 
  + '/albums/' + albumHash 
  + '/images/' + imageHash 
  + '/thumb/' 
  + orientation + size + (animated ? 'a' : '') 
  + (sign ? '?sign='+ sign : ''),

}

export default urls
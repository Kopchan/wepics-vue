import { API_PATH } from "@/config"

export default {
  root: () => API_PATH,

  setups: () => API_PATH + '/setups',

  authSignUp: () => API_PATH + '/users/reg',
  authLogIn : () => API_PATH + '/users/login',
  authLogOut: () => API_PATH + '/users/logout',

  reactions: () => API_PATH + '/reactions',

  users: () => API_PATH + '/users',

  albumInfo     : (albumHash, {sort = null, images = 0, isReverse = false} = {}) => 
    API_PATH + '/albums/' + albumHash + '?' + 
    (images ? 'images=' + images : '') +
    (sort ? '&sort=' + sort : '') + 
    (isReverse ? '&reverse' : ''),

  albumReindex  : (albumHash) => API_PATH + '/albums/' + albumHash + '/reindex',
  albumAccesses : (albumHash) => API_PATH + '/albums/' + albumHash + '/access',
  albumImages   : (albumHash, {page = 1, limit = 30, sort = 'name', tags = [], isReverse = false, nested = false} = {}) => 
    API_PATH +
    '/albums/' + albumHash +
    '/images?page=' + page +
    '&limit=' +      limit +
    '&sort=' +        sort +
    (tags.length ? '&tags=' + tags.value.map(elem => encodeURIComponent(elem))?.join(',') : '') +
    (isReverse ? '&reverse' : '') +
    (nested ? '&nested' + (nested == 'force' ? '=force' : '') : ''),

  imageReaction : (albumHash, imageHash, reaction)                       => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/reactions?reaction=' + reaction,
  imageOrig     : (albumHash, imageHash, sign = null)                    => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/orig' +                        (sign ? '?sign='+ sign : ''),
  imageDownload : (albumHash, imageHash, sign = null)                    => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/download' +                    (sign ? '?sign='+ sign : ''),
  imageThumb    : (albumHash, imageHash, sign = null, orientation, size) => API_PATH + '/albums/' + albumHash + '/images/' + imageHash + '/thumb/' + orientation + size + (sign ? '?sign='+ sign : ''),

}


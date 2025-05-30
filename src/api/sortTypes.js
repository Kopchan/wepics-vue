import { 
  ArrowDownUpIcon, BookAIcon, CalendarIcon, DicesIcon, RulerDimensionLineIcon, ProportionsIcon, 
  RatioIcon, SaveIcon, SmileIcon, ImagePlayIcon, HourglassIcon, GalleryHorizontalEndIcon, 
  FoldersIcon, FileIcon, ImageIcon, VideoIcon, Music2Icon, FolderPlusIcon, SearchCheckIcon,
  ArchiveIcon,
} from "lucide-vue-next"

export const imagesSortTypes = [
  { name: 'Name'      , value: 'name'      , reverse: false , icon: BookAIcon },
  { name: 'Date'      , value: 'date'      , reverse: true  , icon: CalendarIcon },
  { name: 'Random'    , value: 'random'    , reverse: null  , icon: DicesIcon },
  { name: 'Size'      , value: 'size'      , reverse: true  , icon: SaveIcon },
  { name: 'Height'    , value: 'height'    , reverse: true  , icon: RulerDimensionLineIcon },
  { name: 'Width'     , value: 'width'     , reverse: true  , icon: RulerDimensionLineIcon },
  { name: 'Ratio'     , value: 'ratio'     , reverse: true  , icon: ProportionsIcon },
  { name: 'Squareness', value: 'square'    , reverse: false , icon: RatioIcon },
  { name: 'Reacts'    , value: 'reacts'    , reverse: true  , icon: SmileIcon },
  { name: 'Duration'  , value: 'duration'  , reverse: true  , icon: HourglassIcon },
  { name: 'Bitrate'   , value: 'bitrate'   , reverse: true  , icon: ArrowDownUpIcon },
  { name: 'Framerate' , value: 'framerate' , reverse: true  , icon: GalleryHorizontalEndIcon },
  // { name: 'Frames'    , value: 'frames'    , reverse: true  , icon: ImagesIcon },
]

export const albumsSortTypes = [
  { name: 'Name'       , value: 'name'      , reverse: false , icon: BookAIcon },
  { name: 'Content'    , value: 'content'   , reverse: true  , icon: ArchiveIcon },
  { name: 'Random'     , value: 'random'    , reverse: null  , icon: DicesIcon },
  { name: 'Size'       , value: 'size'      , reverse: true  , icon: SaveIcon },
  { name: 'Duration'   , value: 'duration'  , reverse: true  , icon: HourglassIcon },
  { name: 'Albums'     , value: 'albums'    , reverse: true  , icon: FoldersIcon },
  { name: 'Medias'     , value: 'medias'    , reverse: true  , icon: FileIcon },
  { name: 'Images'     , value: 'images'    , reverse: true  , icon: ImageIcon },
  { name: 'Videos'     , value: 'videos'    , reverse: true  , icon: VideoIcon },
  { name: 'Audios'     , value: 'audios'    , reverse: true  , icon: Music2Icon },
  { name: 'Created'    , value: 'created'   , reverse: true  , icon: FolderPlusIcon },
  { name: 'Indexed'    , value: 'indexed'   , reverse: true  , icon: SearchCheckIcon },
  // { name: 'Frames'    , value: 'frames'    , reverse: true  , icon: ImagesIcon },
]
import { imagesSortTypes } from "@/api"

export const reverseCheckInSortType = (refPiniaSortType, refIsReveres, refSort) => {
  if (refPiniaSortType.value != null)
    return refPiniaSortType.value.reverse !== refIsReveres.value
  else {
    const sortType = imagesSortTypes.find(s => s.value === refSort.value)
    if (!sortType) return refIsReveres.value
    return sortType?.reverse !== refIsReveres.value
  }
} 
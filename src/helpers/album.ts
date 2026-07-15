import type { Ref } from "vue"
import type { SortType } from "@/types"
import { imagesSortTypes } from "@/api"

export const reverseCheckInSortType = (
  refPiniaSortType: Ref<SortType | null | undefined>,
  refIsReveres: Ref<boolean>,
  refSort: Ref<string>,
): boolean => {
  if (refPiniaSortType.value != null)
    return refPiniaSortType.value.reverse !== refIsReveres.value
  else {
    const sortType = imagesSortTypes.find(s => s.value === refSort.value)
    if (!sortType) return refIsReveres.value
    return sortType?.reverse !== refIsReveres.value
  }
}
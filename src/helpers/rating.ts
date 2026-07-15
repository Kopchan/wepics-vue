import type { AgeRating, RatingPreset } from "@/types"

export const ratingPreset = (
  allAgeRatings: AgeRating[] | undefined,
  albumRating: string | number | undefined,
  imgRating: string | number | undefined,
): RatingPreset | false | undefined => {
  if (!albumRating && !imgRating)
    return false

  const rating = allAgeRatings?.find(r =>
    r.id === (imgRating ?? albumRating)
  )

  const preset = rating?.preset

  if (!preset)
    return

  if (preset === 'hide' || preset === 'blur')
    return preset
}
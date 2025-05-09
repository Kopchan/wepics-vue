export const ratingPreset = (allAgeRatings, albumRating, imgRating) => {
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
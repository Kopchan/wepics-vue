export const sleep = async (ms) =>
  new Promise(_ => setTimeout(_, ms))

export default sleep

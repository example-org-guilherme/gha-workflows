
module.exports = async ({ core, github, context }) => {

  const fs = require('fs')

  const availableRecencyFilterTypes = ["NONE", "WEEK"]
  const recencyFilterType = JSON.parse(process.env.INPUTS).recency_filter_type

  console.log("Checking if today is a proper day for release according to the recency filter :)")
  console.log(`Recency filter type: ${recencyFilterType}`)

  if (!availableRecencyFilterTypes.indexOf(recencyFilterType) == -1) {
    console.error("Please use one of the supported recency_filter_type(s): %s", availableRecencyFilterTypes)
    process.exit(1)
  }

  const release = (
    await github.rest.repos.getLatestRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
    }).catch(e => {
      console.error("Error upon trying to find release:", e)
      if (e.status == 404) {
        return {}
      } else {
        throw e
      }
    })
  ).data

  if (!release) {
    console.log("No release detected, so no problem! Let's release :)")
    return
  }
  console.log("Detected release:", release)

  let shouldRelease = true
  const date = Date.now()
  switch (recencyFilterType) {
    case "WEEK":
      // a bit of help from here: https://stackoverflow.com/questions/64293190/how-to-get-week-number-since-epoch-like-millis :)
      let lastReleaseWeek = Math.floor((new Date(release.created_at).getTime() + 345_600_000) / 604_800_000)
      let currentWeek = Math.floor((date + 345_600_000) / 604_800_000)

      console.info("Recency filter: Current Week: %d, Last release week: %d", currentWeek, lastReleaseWeek)

      if (!lastReleaseWeek || !currentWeek) {
        core.setFailed("Unexpected current week or release week")
        process.exit(1)
      }

      if (lastReleaseWeek == currentWeek) {
        shouldRelease = false
        console.info("Should NOT release today because there has already been a release this week!")
      }
      break
    default:
      throw new Error(`Unsupported recencyFilterType: ${recencyFilterType}`)
  }

  if (!shouldRelease) {
    const message = `⏭️ A release has already been made recently enough according to the recency filter [${recencyFilterType}], so we'll skip automatic release creation!`
    core.setFailed(message)
    console.log("Release details: ", JSON.stringify(release))
    process.exit(1)
  } else {
    console.log("We are okay to release today! :)")
  }

}
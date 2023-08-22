
module.exports = async ({core}) => {

  const availableScheduleFilterTypes = ["NONE", "EVERY_3_WEEKS"]
  const scheduleFilterType = JSON.parse(process.env.INPUTS).schedule_filter_type

  console.log("Checking if today is a proper day for release according to the schedule :)")
  console.log("Schedule filter type: %s", scheduleFilterType)

  if (!availableScheduleFilterTypes.indexOf(scheduleFilterType) == -1) {
    console.error("Please use onf of the supported schedule_filter_type(s): %s", availableScheduleFilterTypes)
    process.exit(1)
  }

  let shouldRelease = true
  const date = Date.now()
  switch (scheduleFilterType) {
    case "EVERY_3_WEEKS":
      // a bit of help from here: https://stackoverflow.com/questions/64293190/how-to-get-week-number-since-epoch-like-millis :)
      let currentWeek = Math.floor((date + 345_600_000) / 604_800_000)
      let thirdWeekModulus = currentWeek % 3
      console.info("Schedule filter: Week: %d, Weeks to 'third week': %d", currentWeek, 3 - thirdWeekModulus)
      if (thirdWeekModulus != 0) {
        shouldRelease = false
        console.info("Should NOT release today because it's not a 'third week'.")
      }
  }

  if (!shouldRelease) {
    const message = `⏭️ The current date does not fit into the schedule filter [${scheduleFilterType}], so we'll skip automatic release creation!`
    core.setFailed(message)
    process.exit(1)
  } else {
    console.log("We are okay to release today! :)")
  }

}
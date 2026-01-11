const schedule = require('node-schedule');
const { DateTime } = require('luxon');
exports.nextRun = async function (execTime, timezone, dayofweek, dayofmonth) {
  try {
    const rule = new schedule.RecurrenceRule();
    const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    if (execTime) {
      const timeSplit = execTime.split(':');
      rule.hour = timeSplit[0];
      rule.minute = timeSplit[1];
    };
    if (timezone) { rule.tz = timezone };
    if (dayofweek) { rule.dayOfWeek = weekDays.indexOf(dayofweek) };
    if (dayofmonth) { rule.date = dayofmonth };
    const job = schedule.scheduleJob(rule, function () {
      console.log('Time conversion started');
    });
    const nextDate = job.nextInvocation();
    return nextDate.toISOString();
  }
  catch (error) {
    console.log(error);
  }
}

exports.getNextRunTime = async function (runAtTime, timeZone, dayOfWeek, dayOfMonth) {
  try {
    const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const [hour, minute] = runAtTime.split(':').map(Number);
    let currentTime = DateTime.now().setZone(timeZone);
    let nextRunTime;
    if (dayOfWeek) {
      nextRunTime = currentTime.set({
        weekDay: weekDays.indexOf(dayOfWeek),
        hour,
        minute,
        second: 0,
        millisecond: 0
      });

      if (nextRunTime <= currentTime) {
        nextRunTime = nextRunTime.plus({ weeks: 1 })
      }
    } else if (dayOfMonth) {
      nextRunTime = currentTime.set({
        day: dayOfMonth,
        hour,
        minute,
        second: 0,
        millisecond: 0
      });

      if (nextRunTime <= currentTime) {
        nextRunTime = nextRunTime.plus({ months: 1 })
      }
    }
    if(nextRunTime) {
    return {
      "nextRunTime": nextRunTime.toUTC().toISO()
    }} else {
      throw new Error("Unable to calculate nextRunTime")
    }
  }
  catch (error) {
    console.log(error);
  }
}
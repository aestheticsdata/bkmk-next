const { format } = require('date-fns');

module.exports = (queryFrom, queryTo) => {
  const dateFormat = 'yyyy-MM-dd';
  // best explanation to date in js and timezone :
  // https://stackoverflow.com/questions/48172772/time-zone-issue-involving-date-fns-format
  // another solution to get rid of timezone is just to substring the date without the timezone
  let from;
  let to;

  if (queryFrom) {
    const dateFrom =  new Date(queryFrom);
    const dateFromWithoutTimezone = new Date(dateFrom.valueOf() + dateFrom.getTimezoneOffset() * 60 * 1000);
    from = format(dateFromWithoutTimezone, dateFormat);
  }

  if (queryTo) {
    const dateTo = new Date(queryTo);
    const dateToWithoutTimezone = new Date(dateTo.valueOf() + dateTo.getTimezoneOffset() * 60 * 1000);
    to = format(dateToWithoutTimezone, dateFormat);
  }

  return {
    from,
    to,
  };
};


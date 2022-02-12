const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0");
  };
  
exports.timeConverter = (timestamp) => {
  var ms = Date.now() - timestamp * 1000;

  var unit = 0;
  var MINUTE = 60 * 1000;
  var HOUR = 60 * 60 * 1000;
  var DAY = 24 * 60 * 60 * 1000;
  var MONTH = 30 * 24 * 60 * 60 * 1000;
  var YEAR = 12 * 30 * 24 * 60 * 60 * 1000;

  if (ms < 2 * MINUTE) {
    return "a minute ago";
  }
  if (ms < HOUR) {
    while (ms >= MINUTE) {
      ms -= MINUTE;
      unit += 1;
    }
    return unit + " minutes ago";
  }
  if (ms < 2 * HOUR) {
    return "an hour ago";
  }
  if (ms < DAY) {
    while (ms >= HOUR) {
      ms -= HOUR;
      unit += 1;
    }
    return unit + " hours ago";
  }
  if (ms < 2 * DAY) {
    return "a day ago";
  }
  if (ms < MONTH) {
    while (ms >= DAY) {
      ms -= DAY;
      unit += 1;
    }
    return unit + " days ago";
  }
  if (ms < 2 * MONTH) {
    return "a month ago";
  }
  if (ms < YEAR) {
    while (ms >= MONTH) {
      ms -= MONTH;
      unit += 1;
    }
    return unit + " months ago";
  }
  if (ms < 2 * YEAR) {
    return "a year ago";
  } else {
    while (ms >= YEAR) {
      ms -= YEAR;
      unit += 1;
    }
    return unit + " years ago";
}
};

exports.dateConverter = (timestamp) => {
  var date = new Date(timestamp * 1000);
  return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
};

exports.formatDate = (date) => {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
};

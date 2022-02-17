exports.time = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0");
  };
  
exports.timeConverter = (date) => {
  let ms = Date.now() - new Date(date);
  // var ms = Date.now() - timestamp * 1000;

  let unit = 0;
  let MINUTE = 60 * 1000;
  let HOUR = 60 * 60 * 1000;
  let DAY = 24 * 60 * 60 * 1000;
  let MONTH = 30 * 24 * 60 * 60 * 1000;
  let YEAR = 12 * 30 * 24 * 60 * 60 * 1000;

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

exports.dateConverter = (date) => {
  let newDate = new Date(date);
  // let date = new Date(timestamp * 1000);
  return `${newDate.toDateString()}, ${newDate.toLocaleTimeString()}`;
};

exports.formatDate = (date) => {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
};

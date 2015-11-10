'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        //cur_timezone: -Math.floor(new Date().getTimezoneOffset() / 60),
        cur_timezone: -Math.floor(new Date().getTimezoneOffset() / 60),

        get timezone () {
            return this.cur_timezone;
        },

        set timezone (value) {
            this.cur_timezone = value;
        },

        set dateOfMoment (value) {
            this.date = value;
        },

        // Выводит дату в переданном формате
        format: function (pattern) {
            //console.log(this.cur_timezone);
            var ch;
            var time = toLocalTime(this.date, this.timezone);
            var str = pattern.replace('%DD', getWeekDay(time.day));
            if (time.hours == 0) {
                ch = time.hours.toString();
                str = str.replace('%HH', ch + ch);
            } else {
                str = str.replace('%HH', time.hours);
            }
            if (time.minutes == 0) {
                ch = time.minutes.toString();
                return str.replace('%MM', ch + ch);
            } else {
                return str.replace('%MM', time.minutes);
            }
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};

function getWeekDay(day) {
    var days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

    return days[day];
}

function toLocalTime(date, timezone) {
    date.hours += timezone;
    if (date.hours < 0) {
        date.hours += 24;
        date.day -= 1;
    } else {
        date.day = date.day + Math.floor(date.hours / 24);
        date.hours = date.hours % 24;
    }
    return date;
}

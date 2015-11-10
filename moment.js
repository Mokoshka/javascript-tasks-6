'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
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
            var time = toLocalTime(this.date, this.timezone);
            var str = pattern.replace('%DD', getWeekDay(time.day));
            str = str.replace('%HH', time.hours);
            return str.replace('%MM', time.minutes);
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

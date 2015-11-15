'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        //cur_timezone: -Math.floor(new Date().getTimezoneOffset() / 60),
        cur_timezone: 5,

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
            if (this.date === undefined) {
                return "Время не найдено";
            }
            var time = toLocalTime(this.date, this.timezone);
            var str = pattern.replace('%DD', getWeekDay(time.day).toUpperCase());
            var edin = time.hours % 10;
            var des = (time.hours - edin) / 10;
            str = str.replace('%HH', des.toString() + edin.toString());

            edin = this.date.minutes % 10;
            des = (this.date.minutes - edin) / 10;
            return str.replace('%MM', des.toString() + edin.toString());
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
    var hours = date.hours + timezone;
    var day = date.day + Math.floor(hours / 24);
    hours = hours % 24;
    return {
        day: day,
        hours: hours,
        minutes: date.minutes,
        timezone: timezone,
        valueOf: date.valueOf()
    };
}

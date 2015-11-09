'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        cur_timezone: new Date().getTimezoneOffset() / 60,

        get timezone () {
            return this.cur_timezone;
        },

        set timezone (value) {
            this.date.hours += value;
            this.cur_timezone = value;
        },

        set dateOfMoment (value) {
            this.date = value;
        },

        // Выводит дату в переданном формате
        format: function (pattern) {
            var str = pattern.replace('%DD', this.date['day']);
            str = str.replace('%HH', this.date['time'].getHours());
            return str.replace('%MM', this.date['time'].getMinutes());
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};


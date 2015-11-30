'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    var gangs = JSON.parse(json);
    // 2. Находим подходящий ближайший момент начала ограбления
    var time = findTime(gangs, minDuration, workingHours, appropriateMoment.timezone);
    // 3. И записываем в appropriateMoment
    appropriateMoment.dateOfMoment = time;

    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};

function checkDay(day) {
    switch (day) {
        case 'ПН': return 1;
        case 'ВТ': return 2;
        case 'СР': return 3;
        default: return 1;
    }
}

function parse(string) {
    var reDate = /^([А-Яа-я]{2})? ?(\d{2}):(\d{2})([+-]\d)/;
    var match = reDate.exec(string);
    if (match != null) {
        return toUTC({
            day: checkDay(match[1]),
            hours: parseInt(match[2]),
            minutes: parseInt(match[3]),
            timezone: parseInt(match[4]),
            valueOf: function () {
                return this.minutes + this.hours * 60 + this.day * 60 * 24;
            }
        });
    }
    return -1;
}

function toUTC(date) {
    date.hours -= date.timezone;
    if (date.hours <= 0) {
        date.hours += 24;
        date.day -= 1;
    } else {
        date.day = date.day + Math.floor(date.hours / 24);
        date.hours = date.hours % 24;
    }
    return date;
}

function findTime(gangs, minDuration, workingHouse) {
    var from = [];
    var to = [];
    var begin = parse(workingHouse.from);
    var end = parse(workingHouse.to);
    if (end < begin) {
        end.day += 1;
    }
    var i;
    for (var name in gangs) {
        for (i = 0; i < gangs[name].length; i++) {
            from.push(parse(gangs[name][i].from));
            to.push(parse(gangs[name][i].to));
        }
    }
    var current = from.slice();
    current.sort(function (time1, time2) {
        return time1 >= time2;
    });
    var k = 0;
    var time = [];
    time[k] = {};
    time[k].from = current[k];
    time[k].to = to[from.indexOf(current[k])];
    var len = current.length;
    for (i = 1; i < len; i++) {
        if (to[from.indexOf(current[i])] > time[k].to) {
            if (current[i] <= time[k].to) {
                time[k].to = to[from.indexOf(current[i])];
            } else {
                k += 1;
                time[k] = {};
                time[k].from = current[i];
                time[k].to = to[from.indexOf(current[i])];
            }
        }
    }
    var pointer = begin;
    i = 0;
    while (i <= time.length) {
        if (i < time.length) {
            if (pointer >= begin && time[i].from >= pointer + minDuration &&
                end >= pointer + minDuration) {
                return pointer;
            } else {
                if (time[i].to > begin) {
                    pointer = time[i].to;
                }
                if (pointer >= end) {
                    begin.day += 1;
                    end.day += 1;
                    if (pointer <= begin) {
                        console.log('begin: ', begin);
                        pointer = begin;
                    }
                }
                i += 1;
            }
        } else {
            if (pointer >= begin && pointer + minDuration <= end) {
                return pointer;
            }
            i ++;
        }
    }
}

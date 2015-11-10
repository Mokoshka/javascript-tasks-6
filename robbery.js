'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    //console.log(appropriateMoment.timezone);
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
            timezone: parseInt(match[4])
        });
    }
    return -1;
}

function compare (time1, time2) {
    if (time1.day == time2.day) {
        if (time1.hours == time2.hours) {
            if (time1.minutes == time2.minutes) {
                return 0;
            } else if (time1.minutes < time2.minutes) {
                return -1;
            } else {
                return 1;
            }
        } else if (time1.hours < time2.hours) {
            return -1;
        } else {
            return 1;
        }
    } else if (time1.day < time2.day) {
        return -1;
    } else {
        return 1;
    }
}

function addMinutes(time, minutes) {
    minutes = time.minutes + minutes;
    var hours = time.hours + Math.floor(minutes / 60);
    minutes = minutes % 60;
    var day = time.day +  Math.floor(hours / 24);
    hours = hours % 24;
    return {
        day: day,
        hours: hours,
        minutes: minutes,
        timezone: time.timezone
    };
}

function toUTC(date) {
    date.hours -= date.timezone;
    if (date.hours < 0) {
        date.hours += 24;
        date.day -= 1;
    } else {
        date.day = date.day +  Math.floor(date.hours / 24);
        date.hours = date.hours % 24;
    }
    return date;
}

function findTime(gangs, minDuration, workingHouse) {
    var from = [];
    var to = [];
    var begin = parse(workingHouse.from);
    var end = parse(workingHouse.to);
    for (var name in gangs) {
        for (var i=0; i<gangs[name].length; i++) {
            from.push(parse(gangs[name][i].from));
            to.push(parse(gangs[name][i].to));
        }
    }
    var current = from.slice();
    current.sort(compare);
    var k = 0;
    var time = [];
    time[k] = {};
    time[k].from = current[k];
    time[k].to = to[from.indexOf(current[k])];
    //console.log(current);
    var len = current.length;
    for (i=1; i<len; i++) {
        if (compare(to[from.indexOf(current[i])], time[k].to) > 0) {
            if (compare(current[i], time[k].to) <= 0) {
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
    while (i <= k) {
        if (compare(pointer, begin) >= 0 && compare(time[i].from, addMinutes(pointer, minDuration)) >= 0 &&
            compare(end, addMinutes(pointer, minDuration)) >= 0) {
            return pointer;
        } else {
            pointer = time[i].to;
            if (compare(pointer, end) >= 0) {
                begin.day += 1;
                end.day += 1;
                pointer = begin;
            } else {
                i += 1;
            }
        }
    }
}

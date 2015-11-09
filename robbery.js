'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    var gangs = JSON.parse(json);
    // 2. Находим подходящий ближайший момент начала ограбления
    var time = findTime(gangs, minDuration, workingHours);
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
        case 'Пн': return 1;
        case 'Вт': return 2;
        case 'Ср': return 3;
    }
}

function parse(string) {
    var reDate = /^([А-Яа-я]{2})? (\d{2}):(\d{2})([+-]\d)/;
    var match = reDate.exec(string);
    if (match != null){
        return {
            day: checkDay(match[1]),
            hours: parseInt(match[2]),
            minutes: parseInt(match[3]),
            timezone: parseInt(match[4])
        };
    }
    return -1;
}

function findMin(container) {
    var min = container[0];
    for (var i=1; i<container.length; i++) {
        if (min.day > container[i].day) {
            min = container[i];
        } else if (min.day == container[i].day) {
            if (min.hours > container[i].hours) {
                min = container[i];
            } else if (min.hours == container[i].hours) {
                if (min.minutes > container[i].minutes) {
                    min = container[i];
                }
            }
        }
    }
    return min;
}

function difference (time1, time2) {
    var hours;
    var mins;
    if (time1.day < time2.day) {
        hours = 24 - time1.hours + time2.hours;
    } else if (time2.day < time1.day) {
        hours = 24 - time2.hours + time1.hours;
    } else {
        hours = Math.abs(time1.hours - time2.hours);
    }
    if (time1.hours < time2.hours) {
        mins = 24 - time1.minutes + time2.minutes;
    } else if (time2.hours < time1.hours) {
        mins = 24 - time2.minutes + time1.minutes;
    } else {
        mins = Math.abs(time1.minutes - time2.minutes);
    }
    return hours * 60 + mins;
}

function findTime(gangs, minDuration, workingHouse) {
    var from = [];
    var to = [];
    var begin = parse(workingHouse.from);
    var end = parse(workingHouse.to);
    for (var i=0; i<3; i++) {
        for (var name in gangs) {
            from.push(parse(gangs[name][i].from));
            to.push(parse(gangs[name][i].to));
        }
        var minFrom = findMin(from);
        var minTo = findMin(to);
        if (difference(minFrom, minTo) >= minDuration && minFrom.hours - begin.hours >= 0 &&
            end.hours - minFrom.hours + 1 >= 0) {
            return {
                day: from[i][0],
                time: minFrom
            }
        }
    }
}

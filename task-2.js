"use strict";
/* 
Задание №2. Напишите программу, которая будет принимать на вход несколько аргументов: дату и время в формате «час-день-месяц-год». Задача программы — создавать для каждого аргумента таймер с обратным отсчётом: посекундный вывод в терминал состояния таймеров (сколько осталось). По истечении какого-либо таймера, вместо сообщения о том, сколько осталось, требуется показать сообщение о завершении его работы. Важно, чтобы работа программы основывалась на событиях.
*/

import pkgMoment from "moment";
import pkgPrecisePlugin from "moment-precise-range-plugin";
import pkgReadline from "readline";
import pkgColors from "colors";
import EventEmitter from "events";

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

const moment = pkgMoment;
const readline = pkgReadline;
const colors = pkgColors;
const rl = readline.createInterface(process.stdin, process.stdout);

const DATA_FORMAT_PATTERN = "YYYY-MM-DD HH:mm:ss";
const dateReg = /^\d{2}([/-])\d{2}([/-])\d{2}([/-])\d{4}$/;
let targetDate, timerId;

const question = (mess) => {
  return new Promise((resolve, reject) => {
    rl.question(mess, (answer) => {
      if (answer.match(dateReg)) {
        resolve(answer);
      } else {
        reject(
          colors.red(
            "Error: The value must be in the hour-day-month-year format."
          )
        );
      }
    });
  });
};

const getStringToDate = (val) => {
  const [hour, day, month, year] = val.split("-");
  return new Date(Date.UTC(year, month - 1, day, hour));
};

const showRemainingTime = () => {
  const startDate = new Date(
    moment.utc(moment().format(), DATA_FORMAT_PATTERN)
  );
  if (startDate > targetDate) {
    emitter.emit("timerFinish");
  } else {
    const diff = moment.preciseDiff(startDate, targetDate);
    console.clear();
    console.log(
      colors.blue("Time until the end of the timer:"),
      colors.red(diff)
    );
  }
};

const timerFinished = () => {
  clearInterval(timerId);
  console.log(colors.green(" \n The timer has finished success! \n"));
  rl.close();
};

const startTimer = () => {
  timerId = setInterval(() => {
    emitter.emit("timerTick");
  }, 1000);
};

const main = async () => {
  await question(
    colors.green(
      `Enter the date and time in the ${colors.blue(
        "hour-day-month-year"
      )} format: `
    )
  ).then(
    (res) => {
      targetDate = new Date(
        moment.utc(getStringToDate(res), DATA_FORMAT_PATTERN)
      );
    },
    (err) => {
      console.log(err);
      process.exit(1);
    }
  );

  startTimer();

  rl.close();
};

emitter.on("timerTick", showRemainingTime);
emitter.on("timerFinish", () => {
  timerFinished();
});

main();

'use strict';

const Performance = require('..');

const pred = [
    [0, 0.1, 0.8, 0.9],
    [0.1, 0, 0.2, 0.3],
    [0.8, 0.2, 0, 0.4],
    [0.9, 0.3, 0.4, 0]
];

const target = [
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 1]
];

const perf = new Performance(pred, target);

console.log(perf.getAURC());
console.log(perf.getMeasure('fpr'));
console.log(perf.getMeasure('tpr'));

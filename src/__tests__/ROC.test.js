import Performance from '..';

describe('ROC curve', function () {
  it('distance matrix', function () {
    const pred = [
      [0.0, 0.4, 0.8, 0.9, 0.1],
      [0.4, 0.0, 0.3, 0.5, 0.2],
      [0.8, 0.3, 0.0, 0.2, 0.7],
      [0.9, 0.5, 0.2, 0.0, 0.6],
      [0.1, 0.2, 0.7, 0.6, 0.0],
    ];
    const target = [
      [1, 1, 0, 0, 1],
      [1, 1, 0, 0, 1],
      [0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0],
      [1, 1, 0, 0, 1],
    ];

    const perf = new Performance(pred, target);
    expect(perf.nSamples).toStrictEqual(10);
    expect(perf.nPos).toStrictEqual(4);
    expect(perf.nNeg).toStrictEqual(6);
    expect(perf.cutoffs).toStrictEqual([
      Number.MIN_VALUE,
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
    ]);
    expect(perf.fp).toStrictEqual([0, 0, 0, 1, 1, 2, 3, 4, 5, 6]);
    expect(perf.tp).toStrictEqual([0, 1, 3, 3, 4, 4, 4, 4, 4, 4]);
    expect(perf.fn).toStrictEqual([4, 3, 1, 1, 0, 0, 0, 0, 0, 0]);
    expect(perf.tn).toStrictEqual([6, 6, 6, 5, 5, 4, 3, 2, 1, 0]);
    expect(perf.getAURC()).toBeCloseTo(0.958, 3);

    const fpr = perf.getMeasure('fpr');
    expect(fpr[0]).toStrictEqual(0);
    expect(fpr[6]).toStrictEqual(0.5);
    expect(fpr[9]).toStrictEqual(1);

    const tpr = perf.getMeasure('tpr');
    expect(tpr).toStrictEqual([0, 0.25, 0.75, 0.75, 1, 1, 1, 1, 1, 1]);
  });
});

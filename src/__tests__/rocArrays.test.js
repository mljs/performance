import Performance from '..';

describe('Roc curve (Three classes)', () => {
  const categoricalTarget = [
    'class1',
    'class1',
    'class1',
    'class1',
    'class2',
    'class2',
    'class2',
    'class2',
    'class3',
    'class3',
    'class3',
    'class3',
  ];

  const numericTarget = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];

  const predicted = [
    0.95,
    0.15,
    0.13,
    0.08,
    0.93,
    0.91,
    1.99,
    0.12,
    1.85,
    1.95,
    1.75,
    1.99,
  ];

  it('Area under the curve of ROC (Categorical target)', () => {
    const perf = new Performance([categoricalTarget], [predicted], { all: true });
    expect(perf.getAURC()).toBeCloseTo(0.8229, 4);
  });

  it('Area under the curve of ROC (Numeric target)', () => {
    const perf = new Performance([numericTarget], [predicted], { all: true });
    expect(perf.getAURC()).toBeCloseTo(0.8229, 4);
  });
});

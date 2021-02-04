// Accuracy
export function acc(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = (pred.tn[i] + pred.tp[i]) / (l - 1);
  }
  return result;
}

// Error rate
export function err(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.fn[i] + pred.fp[i] / (l - 1);
  }
  return result;
}

// False positive rate
export function fpr(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.fp[i] / pred.nNeg;
  }
  return result;
}

// True positive rate
export function tpr(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.tp[i] / pred.nPos;
  }
  return result;
}

// False negative rate
export function fnr(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.fn[i] / pred.nPos;
  }
  return result;
}

// True negative rate
export function tnr(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.tn[i] / pred.nNeg;
  }
  return result;
}

// Positive predictive value
export function ppv(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] =
      pred.fp[i] + pred.tp[i] !== 0
        ? pred.tp[i] / (pred.fp[i] + pred.tp[i])
        : 0;
  }
  return result;
}

// Negative predictive value
export function npv(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] =
      pred.fn[i] + pred.tn[i] !== 0
        ? pred.tn[i] / (pred.fn[i] + pred.tn[i])
        : 0;
  }
  return result;
}

// Prediction conditioned fallout
export function pcfall(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] =
      pred.fp[i] + pred.tp[i] !== 0
        ? 1 - pred.tp[i] / (pred.fp[i] + pred.tp[i])
        : 1;
  }
  return result;
}

// Prediction conditioned miss
export function pcmiss(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] =
      pred.fn[i] + pred.tn[i] !== 0
        ? 1 - pred.tn[i] / (pred.fn[i] + pred.tn[i])
        : 1;
  }
  return result;
}

// Lift value
export function lift(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] =
      pred.nPosPred[i] !== 0
        ? pred.tp[i] / pred.nPos / (pred.nPosPred[i] / pred.nSamples)
        : 0;
  }
  return result;
}

// Rate of positive predictions
export function rpp(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.nPosPred[i] / pred.nSamples;
  }
  return result;
}

// Rate of negative predictions
export function rnp(pred) {
  const l = pred.cutoffs.length;
  const result = new Array(l);
  for (let i = 0; i < l; i++) {
    result[i] = pred.nNegPred[i] / pred.nSamples;
  }
  return result;
}

// Threshold
export function threshold(pred) {
  const clone = pred.cutoffs.slice();
  clone[0] = clone[1]; // Remove the infinite value
  return clone;
}

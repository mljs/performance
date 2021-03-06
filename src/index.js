/* eslint-disable import/namespace */
import * as measures from './measures';

export default class Performance {
  /**
   *
   * @param {array<array>} [prediction] - The prediction matrix
   * @param {array<array>} [target] - The target matrix (values: truthy for same class, falsy for different class)
   * @param {object} [options={}]
   * @param {boolean} [options.all=false] True if the entire matrix must be used. False to ignore the diagonal and lower part (default is false, for similarity/distance matrices)
   * @param {boolean} [options.max=false] True if the max value corresponds to a perfect match (like in similarity matrices), false if it is the min value (default is false, like in distance matrices. All values will be multiplied by -1)
   */
  constructor(prediction, target, options = {}) {
    if (
      prediction.length !== target.length ||
      prediction[0].length !== target[0].length
    ) {
      throw new Error('dimensions of prediction and target do not match');
    }
    const rows = prediction.length;
    const columns = prediction[0].length;
    const isDistance = !options.max;

    const predP = [];

    if (options.all) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          predP.push({
            pred: prediction[i][j],
            targ: target[i][j],
          });
        }
      }
    } else {
      if (rows < 3 || rows !== columns) {
        throw new Error(
          'When "all" option is false, the prediction matrix must be square and have at least 3 columns',
        );
      }
      for (let i = 0; i < rows - 1; i++) {
        for (let j = i + 1; j < columns; j++) {
          predP.push({
            pred: prediction[i][j],
            targ: target[i][j],
          });
        }
      }
    }

    if (isDistance) {
      predP.sort((a, b) => a.pred - b.pred);
    } else {
      predP.sort((a, b) => b.pred - a.pred);
    }

    const cutoffs = (this.cutoffs = [
      isDistance ? Number.MIN_VALUE : Number.MAX_VALUE,
    ]);
    const fp = (this.fp = [0]);
    const tp = (this.tp = [0]);

    let nPos = 0;
    let nNeg = 0;

    let currentPred = predP[0].pred;
    let nTp = 0;
    let nFp = 0;
    for (let i = 0; i < predP.length; i++) {
      if (predP[i].pred !== currentPred) {
        cutoffs.push(currentPred);
        fp.push(nFp);
        tp.push(nTp);
        currentPred = predP[i].pred;
      }
      if (predP[i].targ) {
        nPos++;
        nTp++;
      } else {
        nNeg++;
        nFp++;
      }
    }
    cutoffs.push(currentPred);
    fp.push(nFp);
    tp.push(nTp);

    const l = cutoffs.length;
    const fn = (this.fn = new Array(l));
    const tn = (this.tn = new Array(l));
    const nPosPred = (this.nPosPred = new Array(l));
    const nNegPred = (this.nNegPred = new Array(l));

    for (let i = 0; i < l; i++) {
      fn[i] = nPos - tp[i];
      tn[i] = nNeg - fp[i];

      nPosPred[i] = tp[i] + fp[i];
      nNegPred[i] = tn[i] + fn[i];
    }

    this.nPos = nPos;
    this.nNeg = nNeg;
    this.nSamples = nPos + nNeg;
  }

  /**
   * Computes a measure from the prediction object.
   *
   * Many measures are available and can be combined :
   * To create a ROC curve, you need fpr and tpr
   * To create a DET curve, you need fnr and fpr
   * To create a Lift chart, you need rpp and lift
   *
   * Possible measures are : threshold (Threshold), acc (Accuracy), err (Error rate),
   * fpr (False positive rate), tpr (True positive rate), fnr (False negative rate), tnr (True negative rate), ppv (Positive predictive value),
   * npv (Negative predictive value), pcfall (Prediction-conditioned fallout), pcmiss (Prediction-conditioned miss), lift (Lift value), rpp (Rate of positive predictions), rnp (Rate of negative predictions)
   *
   * @param measure - The short name of the measure
   *
   * @return [number]
   */
  getMeasure(measure) {
    if (typeof measure !== 'string') {
      throw new Error('No measure specified');
    }
    if (!measures[measure]) {
      throw new Error(`The specified measure (${measure}) does not exist`);
    }
    return measures[measure](this);
  }

  /**
   * Returns the area under the ROC curve
   */
  getAURC() {
    const l = this.cutoffs.length;
    const x = new Array(l);
    const y = new Array(l);
    for (let i = 0; i < l; i++) {
      x[i] = this.fp[i] / this.nNeg;
      y[i] = this.tp[i] / this.nPos;
    }
    let auc = 0;
    for (let i = 1; i < l; i++) {
      auc += 0.5 * (x[i] - x[i - 1]) * (y[i] + y[i - 1]);
    }
    return auc;
  }

  /**
   * Returns the area under the DET curve
   */
  getAUDC() {
    const l = this.cutoffs.length;
    const x = new Array(l);
    const y = new Array(l);
    for (let i = 0; i < l; i++) {
      x[i] = this.fn[i] / this.nPos;
      y[i] = this.fp[i] / this.nNeg;
    }
    let auc = 0;
    for (let i = 1; i < l; i++) {
      auc += 0.5 * (x[i] + x[i - 1]) * (y[i] - y[i - 1]);
    }
    return auc;
  }

  getDistribution(options) {
    options = options || {};
    let cutLength = this.cutoffs.length;
    let cutLow =
      options.xMin || Math.floor(this.cutoffs[cutLength - 1] * 100) / 100;
    let cutHigh = options.xMax || Math.ceil(this.cutoffs[1] * 100) / 100;
    let interval =
      options.interval ||
      Math.floor(((cutHigh - cutLow) / 20) * 10000000 - 1) / 10000000; // Trick to avoid the precision problem of float numbers

    let xLabels = [];
    let interValues = [];
    let intraValues = [];
    let interCumPercent = [];
    let intraCumPercent = [];

    let nTP = this.tp[cutLength - 1];

    let currentTP = 0;
    let nFP = this.fp[cutLength - 1];

    let currentFP = 0;

    for (let i = cutLow, j = cutLength - 1; i <= cutHigh; i += interval) {
      while (this.cutoffs[j] < i) {
        j--;
      }

      xLabels.push(i);

      let thisTP = nTP - currentTP - this.tp[j];
      let thisFP = nFP - currentFP - this.fp[j];

      currentTP += thisTP;
      currentFP += thisFP;

      interValues.push(thisFP);
      intraValues.push(thisTP);

      interCumPercent.push(100 - ((nFP - this.fp[j]) / nFP) * 100);
      intraCumPercent.push(100 - ((nTP - this.tp[j]) / nTP) * 100);
    }

    return {
      xLabels: xLabels,
      interValues: interValues,
      intraValues: intraValues,
      interCumPercent: interCumPercent,
      intraCumPercent: intraCumPercent,
    };
  }
}

Performance.names = {
  acc: 'Accuracy',
  err: 'Error rate',
  fpr: 'False positive rate',
  tpr: 'True positive rate',
  fnr: 'False negative rate',
  tnr: 'True negative rate',
  ppv: 'Positive predictive value',
  npv: 'Negative predictive value',
  pcfall: 'Prediction-conditioned fallout',
  pcmiss: 'Prediction-conditioned miss',
  lift: 'Lift value',
  rpp: 'Rate of positive predictions',
  rnp: 'Rate of negative predictions',
  threshold: 'Threshold',
};

'use strict';

const Performance = require('..');

describe('ROC curve', function () {
    it('distance matrix', function () {
        const pred = [
            [0.0, 0.4, 0.8, 0.9, 0.1],
            [0.4, 0.0, 0.3, 0.5, 0.2],
            [0.8, 0.3, 0.0, 0.2, 0.7],
            [0.9, 0.5, 0.2, 0.0, 0.6],
            [0.1, 0.2, 0.7, 0.6, 0.0]
        ];
        const target = [
            [1  , 1  , 0  , 0  , 1],
            [1  , 1  , 0  , 0  , 1],
            [0  , 0  , 1  , 1  , 0],
            [0  , 0  , 1  , 1  , 0],
            [1  , 1  , 0  , 0  , 1]
        ];
        const perf = new Performance(pred, target);
        
        perf.nSamples.should.equal(10);
        perf.nPos.should.equal(4);
        perf.nNeg.should.equal(6);
        
        perf.cutoffs.should.eql([Number.MIN_VALUE, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
        perf.fp.should.eql([0, 0, 0, 1, 1, 2, 3, 4, 5, 6]);
        perf.tp.should.eql([0, 1, 3, 3, 4, 4, 4, 4, 4, 4]);
        perf.fn.should.eql([4, 3, 1, 1, 0, 0, 0, 0, 0, 0]);
        perf.tn.should.eql([6, 6, 6, 5, 5, 4, 3, 2, 1, 0]);

        perf.getAURC().should.approximately(0.958, 1e-3);
        
        const fpr = perf.getMeasure('fpr');
        fpr[0].should.equal(0);
        fpr[6].should.equal(0.5);
        fpr[9].should.equal(1);
        const tpr = perf.getMeasure('tpr');
        tpr.should.eql([0, 0.25, 0.75, 0.75, 1, 1, 1, 1, 1, 1]);
    });
});

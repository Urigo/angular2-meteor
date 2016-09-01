'use strict';
const utils_1 = require('./utils');
class CursorHandle {
    constructor(hCurObserver, hAutoNotify) {
        utils_1.check(hAutoNotify, Match.Optional(Tracker.Computation));
        utils_1.check(hCurObserver, Match.Where(function (observer) {
            return !!observer.stop;
        }));
        this._hAutoNotify = hAutoNotify;
        this._hCurObserver = hCurObserver;
    }
    stop() {
        if (this._hAutoNotify) {
            this._hAutoNotify.stop();
        }
        this._hCurObserver.stop();
    }
}
exports.CursorHandle = CursorHandle;

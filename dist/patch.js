'use strict';
/**
 * Contains a set of methods used to patch original Meteor methods.
 * After patching, callback parameters are run in the global zone
 * (i.e. outside of Angular2). Also, each callback schedules
 * Angular2 zones run (one per each app) in order to initiate
 * change detection cycles.
 * Scheduling happens in a way to reduce number of zone runs
 * since multiple callbacks can be run near the same time.
 */
const lang_1 = require('@angular/core/src/facade/lang');
const data_observer_1 = require('./data_observer');
const utils_1 = require('./utils');
class ZoneRunScheduler {
    constructor() {
        this._zoneTasks = new Map();
        this._onRunCbs = new Map();
    }
    zoneRun(zone) {
        return () => {
            zone.run(lang_1.noop);
            this._runAfterRunCbs(zone);
            this._zoneTasks.delete(zone);
        };
    }
    runZones() {
        this._zoneTasks.forEach((task, zone) => {
            task.invoke();
        });
    }
    _runAfterRunCbs(zone) {
        if (this._onRunCbs.has(zone)) {
            let cbs = this._onRunCbs.get(zone);
            while (cbs.length !== 0) {
                (cbs.pop())();
            }
            this._onRunCbs.delete(zone);
        }
    }
    scheduleRun(zone) {
        if (zone === utils_1.gZone) {
            return;
        }
        let runTask = this._zoneTasks.get(zone);
        if (runTask) {
            runTask.cancelFn(runTask);
            this._zoneTasks.delete(zone);
        }
        runTask = utils_1.gZone.scheduleMacroTask('runZones', this.zoneRun(zone), { isPeriodic: true }, task => {
            task._tHandler = setTimeout(task.invoke);
        }, task => {
            clearTimeout(task._tHandler);
        });
        this._zoneTasks.set(zone, runTask);
    }
    onAfterRun(zone, cb) {
        utils_1.check(cb, Function);
        if (!this._zoneTasks.has(zone)) {
            cb();
            return;
        }
        let cbs = this._onRunCbs.get(zone);
        if (!cbs) {
            cbs = [];
            this._onRunCbs.set(zone, cbs);
        }
        cbs.push(cb);
    }
}
exports.ZoneRunScheduler = ZoneRunScheduler;
exports.zoneRunScheduler = new ZoneRunScheduler();
function wrapInZone(method, context) {
    let zone = utils_1.g.Zone.current;
    return function (...args) {
        utils_1.gZone.run(() => {
            method.apply(context, args);
        });
        exports.zoneRunScheduler.scheduleRun(zone);
    };
}
function wrapCallback(callback, context) {
    if (_.isFunction(callback)) {
        return wrapInZone(callback, context);
    }
    for (let fn of _.functions(callback)) {
        callback[fn] = wrapInZone(callback[fn], context);
    }
    return callback;
}
// Save original methods.
const trackerAutorun = Tracker.autorun;
const meteorSubscribe = Meteor.subscribe;
const meteorCall = Meteor.call;
const mongoObserve = Mongo.Cursor.prototype.observe;
const mongoObserveChanges = Mongo.Cursor.prototype.observeChanges;
function patchTrackerAutorun(autorun) {
    return function (runFunc, options) {
        runFunc = wrapCallback(runFunc, this);
        const params = lang_1.isPresent(options) ? [runFunc, options] : [runFunc];
        return autorun.apply(this, params);
    };
}
exports.patchTrackerAutorun = patchTrackerAutorun;
;
function patchMeteorSubscribe(subscribe) {
    return function (...args) {
        let callback = args[args.length - 1];
        if (utils_1.isMeteorCallbacks(callback)) {
            args[args.length - 1] = data_observer_1.DataObserver.pushCb(wrapCallback(callback, this));
        }
        else {
            args.push(data_observer_1.DataObserver.pushCb(lang_1.noop));
        }
        return subscribe.apply(this, args);
    };
}
exports.patchMeteorSubscribe = patchMeteorSubscribe;
;
function patchMeteorCall(call) {
    return function (...args) {
        let callback = args[args.length - 1];
        if (utils_1.isMeteorCallbacks(callback)) {
            args[args.length - 1] = data_observer_1.DataObserver.pushCb(wrapCallback(callback, this));
        }
        else {
            args.push(data_observer_1.DataObserver.pushCb(lang_1.noop));
        }
        return call.apply(this, args);
    };
}
exports.patchMeteorCall = patchMeteorCall;
function patchCursorObserve(observe) {
    return function (callbacks) {
        callbacks = wrapCallback(callbacks, this);
        return observe.call(this, callbacks);
    };
}
exports.patchCursorObserve = patchCursorObserve;
;
function patchCursorObserveChanges(observeChanges) {
    return function (callbacks) {
        callbacks = wrapCallback(callbacks, this);
        return observeChanges.call(this, callbacks);
    };
}
exports.patchCursorObserveChanges = patchCursorObserveChanges;
function patchMeteor() {
    Tracker.autorun = patchTrackerAutorun(Tracker.autorun);
    Meteor.subscribe = patchMeteorSubscribe(Meteor.subscribe);
    Meteor.call = patchMeteorCall(Meteor.call);
    Mongo.Cursor.prototype.observe = patchCursorObserve(Mongo.Cursor.prototype.observe);
    Mongo.Cursor.prototype.observeChanges = patchCursorObserveChanges(Mongo.Cursor.prototype.observeChanges);
}
exports.patchMeteor = patchMeteor;
;
function unpatchMeteor() {
    Tracker.autorun = trackerAutorun;
    Meteor.subscribe = meteorSubscribe;
    Meteor.call = meteorCall;
    Mongo.Cursor.prototype.observe = mongoObserve;
    Mongo.Cursor.prototype.observeChanges = mongoObserveChanges;
}
exports.unpatchMeteor = unpatchMeteor;
;
patchMeteor();

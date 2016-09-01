'use strict';
const utils_1 = require('./utils');
/**
 * A helper class for data loading events.
 * For example, used in @MeteorComponent to wrap callbacks
 * of the Meteor methods whic allows us to know when
 * requested data is available on the client.
 */
class DataObserver {
    static pushCb(callbacks) {
        utils_1.check(callbacks, utils_1.Match.Where(utils_1.isMeteorCallbacks));
        const dequeue = (promise) => {
            let index = this._promises.indexOf(promise);
            if (index !== -1) {
                this._promises.splice(index, 1);
            }
        };
        const queue = (promise) => {
            this._promises.push(promise);
        };
        if (utils_1.isCallbacksObject(callbacks)) {
            let origin = callbacks;
            let newCallbacks;
            let promise = new Promise((resolve) => {
                newCallbacks = {
                    onError: (err) => {
                        if (origin.onError) {
                            origin.onError(err);
                        }
                        resolve({ err: err });
                        dequeue(promise);
                    },
                    onReady: (result) => {
                        if (origin.onReady) {
                            origin.onReady(result);
                        }
                        resolve({ result: result });
                        dequeue(promise);
                    },
                    onStop: (err) => {
                        if (origin.onStop) {
                            origin.onStop(err);
                        }
                        resolve({ err: err });
                        dequeue(promise);
                    }
                };
            });
            queue(promise);
            return newCallbacks;
        }
        let newCallback;
        let promise = new Promise((resolve) => {
            newCallback = (err, result) => {
                callbacks(err, result);
                resolve({ err: err, result: result });
                dequeue(promise);
            };
        });
        queue(promise);
        return newCallback;
    }
    static onSubsReady(cb) {
        utils_1.check(cb, Function);
        new Promise((resolve, reject) => {
            const poll = Meteor.setInterval(() => {
                if (DDP._allSubscriptionsReady()) {
                    Meteor.clearInterval(poll);
                    resolve();
                }
            }, 100);
        }).then(() => cb());
    }
    static onReady(cb) {
        utils_1.check(cb, Function);
        Promise.all(this._promises).then(() => cb());
    }
    static cbLen() {
        return this._promises.length;
    }
}
DataObserver._promises = [];
exports.DataObserver = DataObserver;

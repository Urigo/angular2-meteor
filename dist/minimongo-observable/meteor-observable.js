'use strict';
const rxjs_1 = require('rxjs');
const utils_1 = require('../utils');
function throwInvalidCallback(method) {
    throw new Error(`Invalid ${method} arguments:
     your last param can't be a callback function, 
     please remove it and use ".subscribe" of the Observable!`);
}
class MeteorObservable {
    static call(name, ...args) {
        const lastParam = args[args.length - 1];
        if (utils_1.isMeteorCallbacks(lastParam)) {
            throwInvalidCallback('MeteorObservable.call');
        }
        return rxjs_1.Observable.create((observer) => {
            Meteor.call(name, ...args.concat([
                    (error, result) => {
                    error ? observer.error(error) :
                        observer.next(result);
                    observer.complete();
                }
            ]));
        });
    }
    static subscribe(name, ...args) {
        const lastParam = args[args.length - 1];
        if (utils_1.isMeteorCallbacks(lastParam)) {
            throwInvalidCallback('MeteorObservable.subscribe');
        }
        return rxjs_1.Observable.create((observer) => {
            let handler = Meteor.subscribe(name, ...args.concat([{
                    onError: (error) => {
                        observer.error(error);
                        observer.complete();
                    },
                    onReady: () => {
                        observer.next();
                        observer.complete();
                    }
                }
            ]));
            return () => handler.stop();
        });
    }
}
exports.MeteorObservable = MeteorObservable;

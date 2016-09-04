'use strict';
const rxjs_1 = require('rxjs');
const utils_1 = require('../utils');
function throwInvalidCallback(method) {
    throw new Error(`Invalid ${method} arguments:
     your last param can't be a callback function, 
     please remove it and use ".subscribe" of the Observable!`);
}
/**
 * A class with static methods, which wraps Meteor's API and returns
 * RxJS Observable as return value for all Meteor's API.
 * The method's signature is the same as Metoer's, except you don't
 * need to provide callbacks, and you need to "subscribe" instead.
 * The functionality that wrapped in this implementation is Meteor.call
 * and Meteor.subscribe.
 *
 */
class MeteorObservable {
    /**
     *  Method has the same notation as Meteor.call, only without the callbacks:
     *    Meteor.call(name, [...args])
     *
     *  @param {String} name - Name of the method in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the method.
     *   after the func call to initiate change detection.
     *  @returns {Observable<T>} - RxJS Observable, which completes when the server return a response.
     *  @example <caption>Example using Angular2 Component/caption>
     *  class MyComponent  {
     *     constructor() {
     *
     *     }
     *
     *     doAction(payload) {
     *        MeteorObservable.call("myData", payload).subscribe((response) => {
     *           // Handle success and response from server!
     *        }, (err) => {
     *          // Handle error
     *        });
     *     }
     *  }
     */
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
    /**
     *  Method has the same notation as Meteor.subscribe, only without the callbacks:
     *    subscribe(name, [...args])
     *  except the last autoBind param (see autorun above).
     *  You can use this method from any Angular2 element - such as Component, Pipe or
     *  service.
     *
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the publication.
     *   after the func call to initiate change detection.
     *  @returns {Observable} - RxJS Observable, which completes when the subscription is ready.
     *  @example <caption>Example using Angular2 service/caption>
     *  class MyService {
     *     private meteorSubscription: Observable<any>;
     *
     *     constructor() {
     *
     *     }
     *
     *     subscribeToData() {
     *        this.meteorSubscription = MeteorObservable.subscribe<any>("myData").subscribe(() => {
     *           // Subscription is ready!
     *        });
     *     }
     *
     *     unsubscribeToData() {
     *        this.meteorSubscription.dispose();
     *     }
     *  }
     *
     *  @example <caption>Example using Angular2 Component/caption>
     *  class MyComponent implements OnInit, OnDestory {
     *     private meteorSubscription: Observable<any>;
     *
     *     constructor() {
     *
     *     }
     *
     *     ngOnInit() {
     *        this.meteorSubscription = MeteorObservable.subscribe("myData").subscribe(() => {
     *           // Subscription is ready!
     *        });
     *     }
     *
     *     ngOnDestory() {
     *        this.meteorSubscription.dispose();
     *     }
     *  }
     *
     *  @see {@link http://docs.meteor.com/api/pubsub.html|Publications in Meteor documentation}
     */
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

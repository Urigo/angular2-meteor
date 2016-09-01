"use strict";
const rxjs_1 = require('rxjs');
const observable_cursor_1 = require('./observable-cursor');
var MongoObservable;
(function (MongoObservable) {
    'use strict';
    class Collection {
        constructor(name, options) {
            this._collection = new Mongo.Collection(name, options);
        }
        get collection() {
            return this._collection;
        }
        allow(options) {
            return this._collection.allow(options);
        }
        deny(options) {
            return this._collection.deny(options);
        }
        rawCollection() {
            return this._collection.rawCollection();
        }
        rawDatabase() {
            return this._collection.rawDatabase();
        }
        insert(doc) {
            let observers = [];
            let obs = this._createObservable(observers);
            this._collection.insert(doc, (error, docId) => {
                observers.forEach(observer => {
                    error ? observer.error(error) :
                        observer.next(docId);
                    observer.complete();
                });
            });
            return obs;
        }
        remove(selector) {
            let observers = [];
            let obs = this._createObservable(observers);
            this._collection.remove(selector, (error, removed) => {
                observers.forEach(observer => {
                    error ? observer.error(error) :
                        observer.next(removed);
                    observer.complete();
                });
            });
            return obs;
        }
        update(selector, modifier, options) {
            let observers = [];
            let obs = this._createObservable(observers);
            this._collection.update(selector, modifier, options, (error, updated) => {
                observers.forEach(observer => {
                    error ? observer.error(error) :
                        observer.next(updated);
                    observer.complete();
                });
            });
            return obs;
        }
        upsert(selector, modifier, options) {
            let observers = [];
            let obs = this._createObservable(observers);
            this._collection.upsert(selector, modifier, options, (error, affected) => {
                observers.forEach(observer => {
                    error ? observer.error(error) :
                        observer.next(affected);
                    observer.complete();
                });
            });
            return obs;
        }
        find(selector, options) {
            const cursor = this._collection.find(selector, options);
            return observable_cursor_1.ObservableCursor.create(cursor);
        }
        findOne(selector, options) {
            return this._collection.findOne(selector, options);
        }
        _createObservable(observers) {
            return rxjs_1.Observable.create((observer) => {
                observers.push(observer);
                return () => {
                    let index = observers.indexOf(observer);
                    if (index !== -1) {
                        observers.splice(index, 1);
                    }
                };
            });
        }
    }
    MongoObservable.Collection = Collection;
})(MongoObservable = exports.MongoObservable || (exports.MongoObservable = {}));

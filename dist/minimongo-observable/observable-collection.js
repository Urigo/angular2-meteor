"use strict";
const rxjs_1 = require('rxjs');
const observable_cursor_1 = require('./observable-cursor');
var MongoObservable;
(function (MongoObservable) {
    'use strict';
    /**
     * A class represents a MongoDB collection in the client side, wrapped with RxJS
     * Observables, so you can use it with your Angular 2 easier.
     * The wrapper has the same API as Mongo.Collection, only the "find" method returns
     * an ObservableCursor instead of regular Mongo.Cursor.
     */
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
        /**
         *  Method has the same notation as Mongo.Collection.find, only returns Observable.
         *
         *  @param {Mongo.Selector|Mongo.ObjectID|string} selector - A query describing the documents to find
         *  @param {Object} options - Query options, such as sort, limit, etc.
         *  @returns {ObservableCursor<T>} - RxJS Observable wrapped with Meteor features.
         *  @example <caption>Using Angular2 Component</caption>
         *  const MyCollection = MongoObservable.Collection("myCollection");
         *
         *  class MyComponent  {
         *     private myData: ObservableCursor<any>;
         *
         *     constructor() {
         *        this.myData = MyCollection.find({}, {limit: 10});
         *     }
         *  }
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-find|Mongo.Collection on Meteor documentation}
         */
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

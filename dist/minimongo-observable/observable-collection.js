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
     *
     * T is a generic type - should be used with the type of the objects inside the collection.
     */
    class Collection {
        /**
         *  Creates a new Mongo.Collection instance wrapped with Observable features.
         *  @param {String} name - The name of the collection. If null, creates an
         *  unmanaged (unsynchronized) local collection.
         *  @param {ConstructorOptions} options - Creation options.
         *  @constructor
         */
        constructor(name, options) {
            this._collection = new Mongo.Collection(name, options);
        }
        /**
         *  Returns the Mongo.Collection object that wrapped with the MongoObservable.Collection.
         *  @returns {Mongo.Collection<T>} The Collection instance
         */
        get collection() {
            return this._collection;
        }
        /**
         *  Allow users to write directly to this collection from client code, subject to limitations you define.
         *
         *  @returns {Boolean}
         */
        allow(options) {
            return this._collection.allow(options);
        }
        /**
         *  Override allow rules.
         *
         *  @returns {Boolean}
         */
        deny(options) {
            return this._collection.deny(options);
        }
        /**
         *  Returns the Collection object corresponding to this collection from the npm
         *  mongodb driver module which is wrapped by Mongo.Collection.
         *
         *  @returns {Mongo.Collection} The Collection instance
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-rawCollection|rawCollection on Meteor documentation}
         */
        rawCollection() {
            return this._collection.rawCollection();
        }
        /**
         *  Returns the Db object corresponding to this collection's database connection from the
         *  npm mongodb driver module which is wrapped by Mongo.Collection.
         *
         *  @returns {Mongo.Db} The Db instance
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-rawDatabase|rawDatabase on Meteor documentation}
         */
        rawDatabase() {
            return this._collection.rawDatabase();
        }
        /**
         *  Insert a document in the collection.
         *
         *  @param {T} doc - The document to insert. May not yet have an _id
         *  attribute, in which case Meteor will generate one for you.
         *  @returns {Observable<string>} Observable which completes with the inserted ObjectId
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-insert|insert on Meteor documentation}
         */
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
        /**
         *  Remove documents from the collection.
         *
         *  @param {Collection~MongoQuerySelector} selector - Specifies which documents to modify
         *  @returns {Observable<Number>} Observable which completes with the number of affected rows
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-remove|remove on Meteor documentation}
         */
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
        /**
         *  Modify one or more documents in the collection.
         *
         *  @param {Collection~MongoQuerySelector} selector - Specifies which documents to modify
         *  @param {Modifier} modifier - Specifies how to modify the documents
         *  @param {MongoUpdateOptions} options - Update options
         *  first argument and, if no error, the number of affected documents as the second
         *  @returns {Observable<Number>} Observable which completes with the number of affected rows
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-update|update on Meteor documentation}
         */
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
        /**
         *  Finds the first document that matches the selector, as ordered by sort and skip options.
         *
         *  @param {Collection~MongoQuerySelector} selector - Specifies which documents to modify
         *  @param {Modifier} modifier - Specifies how to modify the documents
         *  @param {MongoUpsertOptions} options - Upsert options
         *  first argument and, if no error, the number of affected documents as the second.
         *  @returns {Observable<{numberAffected, insertedId}>} Observable which completes with an
         *  Object that contain the keys numberAffected and insertedId.
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-upsert|upsert on Meteor documentation}
         */
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
         *  @param {Collection~MongoQuerySelector} selector - A query describing the documents to find
         *  @param {Collection~MongoQueryOptions} options - Query options, such as sort, limit, etc.
         *  @returns {ObservableCursor<T>} RxJS Observable wrapped with Meteor features.
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
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-find|find on Meteor documentation}
         */
        find(selector, options) {
            const cursor = this._collection.find(selector, options);
            return observable_cursor_1.ObservableCursor.create(cursor);
        }
        /**
         *  Finds the first document that matches the selector, as ordered by sort and skip options.
         *
         *  @param {Collection~MongoQuerySelector} selector - A query describing the documents to find
         *  @param {Collection~MongoQueryOptions} options - Query options, such as sort, limit, etc.
         *  @returns {any} The first object, or `undefined` in case of non-existing object.
         *
         * @see {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-findOne|findOne on Meteor documentation}
         */
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
/**
 * An options object for MongoDB queries.
 * @typedef {Object} Collection~MongoQueryOptions
 * @property {Object} sort - Sort order (default: natural order)
 * @property {Number} skip - Number of results to skip at the beginning
 * @property {Object} fields - Dictionary of fields to return or exclude.
 * @property {Boolean} reactive - (Client only) Default true; pass false to disable reactivity
 * @property {Function} transform - Overrides transform on the Collection for this cursor. Pass null to disable transformation.
 */
/**
 * A MongoDB query selector representation.
 * @typedef {(Mongo.Selector|Mongo.ObjectID|string)} Collection~MongoQuerySelector
 */
/**
 * A MongoDB query options for upsert action
 * @typedef {Object} Collection~MongoUpsertOptions
 * @property {Boolean} multi - True to modify all matching documents;
 * false to only modify one of the matching documents (the default).
 */
/**
 * A MongoDB query options for update action
 * @typedef {Object} Collection~MongoUpdateOptions
 * @property {Boolean} multi - True to modify all matching documents;
 * @property {Boolean} upsert - True to use upsert logic.
 */

import {Observable, Subscriber} from 'rxjs';

import {ObservableCursor} from './observable-cursor';

import Selector = Mongo.Selector;
import ObjectID = Mongo.ObjectID;
import SortSpecifier = Mongo.SortSpecifier;
import FieldSpecifier = Mongo.FieldSpecifier;
import Modifier = Mongo.Modifier;

export module MongoObservable {
  'use strict';

  export interface ConstructorOptions {
    connection?: Object;
    idGeneration?: string;
    transform?: Function;
  }

  export interface AllowDenyOptionsObject<T> {
    insert?: (userId: string, doc: T) => boolean;
    update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
    remove?: (userId: string, doc: T) => boolean;
    fetch ?: string[];
    transform ?: Function;
  }

  /**
   * A class represents a MongoDB collection in the client side, wrapped with RxJS
   * Observables, so you can use it with your Angular 2 easier.
   * The wrapper has the same API as Mongo.Collection, only the "find" method returns
   * an ObservableCursor instead of regular Mongo.Cursor.
   *
   * T is a generic type - should be used with the type of the objects inside the collection.
   */
  export class Collection<T> {
    private _collection: Mongo.Collection<T>;

    /**
     *  Creates a new Mongo.Collection instance wrapped with Observable features.
     *  @param {String} name - The name of the collection. If null, creates an
     *  unmanaged (unsynchronized) local collection.
     *  @param {ConstructorOptions} options - Creation options.
     *  @constructor
     */
    constructor(name: string, options?: ConstructorOptions) {
      this._collection = new Mongo.Collection<T>(name, options);
    }

    /**
     *  Returns the Mongo.Collection object that wrapped with the MongoObservable.Collection.
     *  @returns {Mongo.Collection<T>} The Collection instance
     */
    get collection(): Mongo.Collection<T> {
      return this._collection;
    }

    /**
     *  Allow users to write directly to this collection from client code, subject to limitations you define.
     *
     *  @returns {Boolean}
     */
    allow(options: AllowDenyOptionsObject<T>): boolean {
      return this._collection.allow(options);
    }

    /**
     *  Override allow rules.
     *
     *  @returns {Boolean}
     */
    deny(options: AllowDenyOptionsObject<T>): boolean {
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
    rawCollection(): any {
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
    rawDatabase(): any {
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
    insert(doc: T): Observable<string> {
      let observers: Subscriber<string>[] = [];
      let obs = this._createObservable<string>(observers);

      this._collection.insert(doc,
        (error: Meteor.Error, docId: string) => {
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
    remove(selector: Selector | ObjectID | string): Observable<number> {
      let observers: Subscriber<number>[] = [];
      let obs = this._createObservable<number>(observers);

      this._collection.remove(selector,
        (error: Meteor.Error, removed: number) => {
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
    update(selector: Selector | ObjectID | string,
           modifier: Modifier,
           options?: { multi?: boolean; upsert?: boolean; }): Observable<number> {
      let observers: Subscriber<number>[] = [];
      let obs = this._createObservable<number>(observers);

      this._collection.update(selector, modifier, options,
        (error: Meteor.Error, updated: number) => {
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
    upsert(selector: Selector | ObjectID | string,
           modifier: Modifier,
           options?: { multi?: boolean; }): Observable<number> {
      let observers: Subscriber<number>[] = [];
      let obs = this._createObservable<number>(observers);

      this._collection.upsert(selector, modifier, options,
        (error: Meteor.Error, affected: number) => {
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
    find(selector?: Selector | ObjectID | string, options?: {
      sort?: SortSpecifier;
      skip?: number;
      limit?: number;
      fields?: FieldSpecifier;
      reactive?: boolean;
      transform?: Function;
    }): ObservableCursor<T> {
      const cursor = this._collection.find(selector, options);
      return ObservableCursor.create<T>(cursor);
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
    findOne(selector?: Selector | ObjectID | string, options?: {
      sort?: SortSpecifier;
      skip?: number;
      fields?: FieldSpecifier;
      reactive?: boolean;
      transform?: Function;
    }): T {
      return this._collection.findOne(selector, options);
    }

    private _createObservable<T>(observers: Subscriber<T>[]) {
      return Observable.create((observer: Subscriber<T>) => {
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
}

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

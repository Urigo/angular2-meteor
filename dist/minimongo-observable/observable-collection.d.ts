import { Observable } from 'rxjs';
import { ObservableCursor } from './observable-cursor';
import Selector = Mongo.Selector;
import ObjectID = Mongo.ObjectID;
import SortSpecifier = Mongo.SortSpecifier;
import FieldSpecifier = Mongo.FieldSpecifier;
import Modifier = Mongo.Modifier;
export declare module MongoObservable {
    interface ConstructorOptions {
        connection?: Object;
        idGeneration?: string;
        transform?: Function;
    }
    interface AllowDenyOptionsObject<T> {
        insert?: (userId: string, doc: T) => boolean;
        update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
        remove?: (userId: string, doc: T) => boolean;
        fetch?: string[];
        transform?: Function;
    }
    /**
     * A class represents a MongoDB collection in the client side, wrapped with RxJS
     * Observables, so you can use it with your Angular 2 easier.
     * The wrapper has the same API as Mongo.Collection, only the "find" method returns
     * an ObservableCursor instead of regular Mongo.Cursor.
     */
    class Collection<T> {
        private _collection;
        constructor(name: string, options?: ConstructorOptions);
        collection: Mongo.Collection<T>;
        allow(options: AllowDenyOptionsObject<T>): boolean;
        deny(options: AllowDenyOptionsObject<T>): boolean;
        rawCollection(): any;
        rawDatabase(): any;
        insert(doc: T): Observable<string>;
        remove(selector: Selector | ObjectID | string): Observable<number>;
        update(selector: Selector | ObjectID | string, modifier: Modifier, options?: {
            multi?: boolean;
            upsert?: boolean;
        }): Observable<number>;
        upsert(selector: Selector | ObjectID | string, modifier: Modifier, options?: {
            multi?: boolean;
        }): Observable<number>;
        /**
         *  Method has the same notation as Mongo.Collection.find, only returns Observable.
         *
         *  @param {Mongo.Selector|Mongo.ObjectID|string} selector - A query describing the documents to find
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
        }): ObservableCursor<T>;
        /**
         *  Finds the first document that matches the selector, as ordered by sort and skip options.
         *
         *  @param {Mongo.Selector|Mongo.ObjectID|string} selector - A query describing the documents to find
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
        }): T;
        private _createObservable<T>(observers);
    }
}

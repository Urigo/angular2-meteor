import { Observable } from 'rxjs';
/**
 *  A class represents a Monog.Cursor wrapped with RxJS features.
 *  @extends Observable
 */
export declare class ObservableCursor<T> extends Observable<T[]> {
    private _cursor;
    private _hCursor;
    private _observers;
    /**
     *  Static method which creates an ObservableCursor from Mongo.Cursor.
     *  Use this to create an ObservableCursor object from an existing Mongo.Cursor.
     *  Prefer to create an Cursors from the ObservableCollection instance instead.
     *
     *  @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor to wrap.
     *  @returns {ObservableCursor<T>} Wrapped Cursor.
     */
    static create<T>(cursor: Mongo.Cursor<T>): ObservableCursor<T>;
    /**
     * @constructor
     * @extends Observable
     * @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor to wrap.
     */
    constructor(cursor: Mongo.Cursor<T>);
    /**
     * Returns the actual Mongo.Cursor that wrapped by current ObservableCursor instance.
     * @return {Mongo.Cursor<T>} The actual MongoDB Cursor.
     */
    cursor: Mongo.Cursor<T>;
    /**
     * Stops the observation on the cursor.
     */
    stop(): void;
    dispose(): void;
    /**
     * Return all matching documents as an Array.
     *
     * @return {Array<T>} The array with the matching documents.
     */
    fetch(): Array<T>;
    /**
     * Watch a query. Receive callbacks as the result set changes.
     * @param {Mongo.ObserveCallbacks} callbacks - The callbacks object.
     * @return {Meteor.LiveQueryHandle} The array with the matching documents.
     */
    observe(callbacks: Mongo.ObserveCallbacks): Meteor.LiveQueryHandle;
    /**
     * Watch a query. Receive callbacks as the result set changes.
     * Only the differences between the old and new documents are passed to the callbacks.
     * @param {Mongo.ObserveChangesCallbacks} callbacks - The callbacks object.
     * @return {Meteor.LiveQueryHandle} The array with the matching documents.
     */
    observeChanges(callbacks: Mongo.ObserveChangesCallbacks): Meteor.LiveQueryHandle;
    _runComplete(): void;
    _runNext(cursor: Mongo.Cursor<T>): void;
    _observeCursor(cursor: Mongo.Cursor<T>): any;
}

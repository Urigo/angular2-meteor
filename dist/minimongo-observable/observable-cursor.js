'use strict';
const rxjs_1 = require('rxjs');
const cursor_handle_1 = require('../cursor_handle');
const utils_1 = require('../utils');
/**
 *  A class represents a Monog.Cursor wrapped with RxJS features.
 *  @extends Observable
 */
class ObservableCursor extends rxjs_1.Observable {
    /**
     * @constructor
     * @extends Observable
     * @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor to wrap.
     */
    constructor(cursor) {
        super((observer) => {
            this._observers.push(observer);
            if (!this._hCursor) {
                this._hCursor = new cursor_handle_1.CursorHandle(this._observeCursor(cursor));
            }
            return () => {
                let index = this._observers.indexOf(observer);
                if (index !== -1) {
                    this._observers.splice(index, 1);
                }
                if (!this._observers.length) {
                    this.stop();
                }
            };
        });
        this._observers = [];
        _.extend(this, _.omit(cursor, 'count', 'map'));
        this._cursor = cursor;
    }
    /**
     *  Static method which creates an ObservableCursor from Mongo.Cursor.
     *  Use this to create an ObservableCursor object from an existing Mongo.Cursor.
     *  Prefer to create an Cursors from the ObservableCollection instance instead.
     *
     *  @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor to wrap.
     *  @returns {ObservableCursor<T>} Wrapped Cursor.
     */
    static create(cursor) {
        return new ObservableCursor(cursor);
    }
    /**
     * Returns the actual Mongo.Cursor that wrapped by current ObservableCursor instance.
     * @return {Mongo.Cursor<T>} The actual MongoDB Cursor.
     */
    get cursor() {
        return this._cursor;
    }
    /**
     * Stops the observation on the cursor.
     */
    stop() {
        if (this._hCursor) {
            this._hCursor.stop();
        }
        this._runComplete();
        this._hCursor = null;
    }
    dispose() {
        this._observers = null;
        this._cursor = null;
    }
    /**
     * Return all matching documents as an Array.
     *
     * @return {Array<T>} The array with the matching documents.
     */
    fetch() {
        return this._cursor.fetch();
    }
    /**
     * Watch a query. Receive callbacks as the result set changes.
     * @param {Mongo.ObserveCallbacks} callbacks - The callbacks object.
     * @return {Meteor.LiveQueryHandle} The array with the matching documents.
     */
    observe(callbacks) {
        return this._cursor.observe(callbacks);
    }
    /**
     * Watch a query. Receive callbacks as the result set changes.
     * Only the differences between the old and new documents are passed to the callbacks.
     * @param {Mongo.ObserveChangesCallbacks} callbacks - The callbacks object.
     * @return {Meteor.LiveQueryHandle} The array with the matching documents.
     */
    observeChanges(callbacks) {
        return this._cursor.observeChanges(callbacks);
    }
    _runComplete() {
        this._observers.forEach(observer => {
            observer.complete();
        });
    }
    _runNext(cursor) {
        this._observers.forEach(observer => {
            observer.next(cursor.fetch());
        });
    }
    _observeCursor(cursor) {
        const handleChange = () => { this._runNext(cursor); };
        return utils_1.gZone.run(() => cursor.observeChanges({
            added: handleChange,
            changed: handleChange,
            removed: handleChange
        }));
    }
}
exports.ObservableCursor = ObservableCursor;

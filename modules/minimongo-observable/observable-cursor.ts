'use strict';

import {Observable, Subscriber} from 'rxjs';

import {CursorHandle} from '../cursor_handle';

import {gZone} from '../utils';

/**
 *  A class represents a Monog.Cursor wrapped with RxJS features.
 *  @extends Observable
 */
export class ObservableCursor<T> extends Observable<T[]> {
  private _cursor: Mongo.Cursor<T>;
  private _hCursor: CursorHandle;
  private _observers: Subscriber<T[]>[] = [];

  /**
   *  Static method which creates an ObservableCursor<T> from Mongo.Cursor<T>.
   *  Use this to create an ObservableCursor object from an existing Mongo.Cursor.
   *  Prefer to create an Cursors from the ObservableCollection instance instead.
   *
   *  @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor<T> to wrap.
   *  @returns {ObservableCursor<T>} Wrapped Cursor.
   */
  static create<T>(cursor: Mongo.Cursor<T>): ObservableCursor<T> {
    return new ObservableCursor<T>(cursor);
  }

  /**
   * @constructor
   * @extends Observable
   * @param {Mongo.Cursor<T>} cursor - The Mongo.Cursor<T> to wrap.
   */
  constructor(cursor: Mongo.Cursor<T>) {
    super((observer: Subscriber<T[]>) => {
      this._observers.push(observer);

      if (!this._hCursor) {
        this._hCursor =  new CursorHandle(
          this._observeCursor(cursor));
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

    _.extend(this, _.omit(cursor, 'count', 'map'));
    this._cursor = cursor;
  }

  /**
   * Returns the actual Mongo.Cursor that wrapped by current ObservableCursor instance.
   * @return {Mongo.Cursor<T>} The actual MongoDB Cursor.
   */
  get cursor(): Mongo.Cursor<T> {
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
  fetch(): Array<T> {
    return this._cursor.fetch();
  }

  /**
   * Watch a query. Receive callbacks as the result set changes.
   * @param {Mongo.ObserveCallbacks} callbacks - The callbacks object.
   * @return {Meteor.LiveQueryHandle} The array with the matching documents.
   */
  observe(callbacks: Mongo.ObserveCallbacks): Meteor.LiveQueryHandle {
    return this._cursor.observe(callbacks);
  }

  /**
   * Watch a query. Receive callbacks as the result set changes.
   * Only the differences between the old and new documents are passed to the callbacks.
   * @param {Mongo.ObserveChangesCallbacks} callbacks - The callbacks object.
   * @return {Meteor.LiveQueryHandle} The array with the matching documents.
   */
  observeChanges(callbacks: Mongo.ObserveChangesCallbacks): Meteor.LiveQueryHandle {
    return this._cursor.observeChanges(callbacks);
  }

  _runComplete() {
    this._observers.forEach(observer => {
      observer.complete();
    });
  }

  _runNext(cursor: Mongo.Cursor<T>) {
    this._observers.forEach(observer => {
      observer.next(cursor.fetch());
    });
  }

  _observeCursor(cursor: Mongo.Cursor<T>) {
    const handleChange = () => { this._runNext(cursor); };
    return gZone.run(
      () => cursor.observeChanges({
        added: handleChange,
        changed: handleChange,
        removed: handleChange
      }));
  }
}

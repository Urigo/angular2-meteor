'use strict';
const rxjs_1 = require('rxjs');
const cursor_handle_1 = require('../cursor_handle');
const utils_1 = require('../utils');
class ObservableCursor extends rxjs_1.Observable {
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
    static create(cursor) {
        return new ObservableCursor(cursor);
    }
    get cursor() {
        return this._cursor;
    }
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
    fetch() {
        return this._cursor.fetch();
    }
    observe(callbacks) {
        return this._cursor.observe(callbacks);
    }
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

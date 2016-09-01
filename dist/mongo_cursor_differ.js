'use strict';
const default_iterable_differ_1 = require('@angular/core/src/change_detection/differs/default_iterable_differ');
const mongo_cursor_observer_1 = require('./mongo_cursor_observer');
function checkIfMongoCursor(cursor) {
    return mongo_cursor_observer_1.MongoCursorObserver.isCursor(cursor);
}
// Creates an MongoCursorObserver instance for a Mongo.Cursor instance.
// Add one more level of abstraction, but currently is not really needed.
class MongoCursorObserverFactory {
    create(cursor) {
        if (checkIfMongoCursor(cursor)) {
            return new mongo_cursor_observer_1.MongoCursorObserver(cursor);
        }
        return null;
    }
}
// An instance of this factory (see providers.ts) is registered globally
// as one of the providers of collection differs.
// These providers are being checked by an ngFor instance to find out which
// differ it needs to create and use for the current collection.
class MongoCursorDifferFactory extends default_iterable_differ_1.DefaultIterableDifferFactory {
    supports(obj) { return checkIfMongoCursor(obj); }
    create(cdRef) {
        return new MongoCursorDiffer(cdRef, new MongoCursorObserverFactory());
    }
}
exports.MongoCursorDifferFactory = MongoCursorDifferFactory;
const trackById = (index, item) => item._id;
/**
 * A class that implements Angular 2's concept of differs for ngFor.
 * API consists mainly of diff method and methods like forEachAddedItem
 * that is being run on each change detection cycle to apply new changes if any.
 */
class MongoCursorDiffer extends default_iterable_differ_1.DefaultIterableDiffer {
    constructor(cdRef, obsFactory) {
        super(trackById);
        this._inserted = [];
        this._removed = [];
        this._moved = [];
        this._updated = [];
        this._changes = [];
        this._forSize = 0;
        this._zone = Zone.current;
        this._obsFactory = obsFactory;
    }
    forEachAddedItem(fn) {
        for (let insert of this._inserted) {
            fn(insert);
        }
    }
    forEachMovedItem(fn) {
        for (let move of this._moved) {
            fn(move);
        }
    }
    forEachRemovedItem(fn) {
        for (let remove of this._removed) {
            fn(remove);
        }
    }
    forEachIdentityChange(fn) {
        for (let update of this._updated) {
            fn(update);
        }
    }
    forEachOperation(fn) {
        for (let change of this._changes) {
            fn(change, change.previousIndex, change.currentIndex);
        }
    }
    diff(cursor) {
        this._reset();
        let newCursor = false;
        if (cursor && this._cursor !== cursor) {
            newCursor = true;
            this._destroyObserver();
            this._cursor = cursor;
            this._curObserver = this._obsFactory.create(cursor);
            this._sub = this._curObserver.subscribe({
                next: changes => this._updateLatestValue(changes)
            });
        }
        if (this._lastChanges) {
            this._applyChanges(this._lastChanges);
        }
        /**
         * If either last changes or new cursor is true, then
         * return "this" to notify Angular2 to re-build views.
         * If last changes or new cursor are true simultaneously
         * means that Mongo cursor has been changed and it's expected
         * that last changes (if any) of that cursor are additions only
         * (otherwise it won't likely work).
         * So removals of the previous cursor and additions of
         * the new one will processed at the same time.
         */
        if (this._lastChanges || newCursor) {
            this._lastChanges = null;
            return this;
        }
        return null;
    }
    onDestroy() {
        this._destroyObserver();
    }
    get observer() {
        return this._curObserver;
    }
    _destroyObserver() {
        if (this._curObserver) {
            this._curObserver.destroy();
        }
        if (this._sub) {
            this._sub.unsubscribe();
        }
        this._applyCleanup();
    }
    _updateLatestValue(changes) {
        this._lastChanges = changes;
    }
    _reset() {
        this._inserted.length = 0;
        this._moved.length = 0;
        this._removed.length = 0;
        this._updated.length = 0;
        this._changes.length = 0;
    }
    // Reset previous state of the differ by removing all currently shown documents.
    _applyCleanup() {
        for (let index = 0; index < this._forSize; index++) {
            let remove = this._createChangeRecord(null, 0, null);
            this._removed.push(remove);
            this._changes.push(remove);
        }
        this._forSize = 0;
    }
    _applyChanges(changes) {
        for (let change of changes) {
            if (change instanceof mongo_cursor_observer_1.AddChange) {
                let add = this._createChangeRecord(change.index, null, change.item);
                this._inserted.push(add);
                this._changes.push(add);
                this._forSize++;
            }
            if (change instanceof mongo_cursor_observer_1.MoveChange) {
                let move = this._createChangeRecord(change.toIndex, change.fromIndex, change.item);
                this._moved.push(move);
                this._changes.push(move);
            }
            if (change instanceof mongo_cursor_observer_1.RemoveChange) {
                let remove = this._createChangeRecord(null, change.index, change.item);
                this._removed.push(remove);
                this._changes.push(remove);
                this._forSize--;
            }
            if (change instanceof mongo_cursor_observer_1.UpdateChange) {
                this._updated.push(this._createChangeRecord(change.index, null, change.item));
            }
        }
    }
    _createChangeRecord(currentIndex, prevIndex, item) {
        let record = new default_iterable_differ_1.CollectionChangeRecord(item, trackById);
        record.currentIndex = currentIndex;
        record.previousIndex = prevIndex;
        return record;
    }
}
exports.MongoCursorDiffer = MongoCursorDiffer;

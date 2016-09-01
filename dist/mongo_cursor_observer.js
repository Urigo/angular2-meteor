'use strict';
const core_1 = require('@angular/core');
const lang_1 = require('@angular/core/src/facade/lang');
const cursor_handle_1 = require('./cursor_handle');
const utils_1 = require('./utils');
class AddChange {
    constructor(index, item) {
        this.index = index;
        this.item = item;
    }
}
exports.AddChange = AddChange;
class UpdateChange {
    constructor(index, item) {
        this.index = index;
        this.item = item;
    }
}
exports.UpdateChange = UpdateChange;
class MoveChange {
    constructor(fromIndex, toIndex) {
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
    }
}
exports.MoveChange = MoveChange;
class RemoveChange {
    constructor(index) {
        this.index = index;
    }
}
exports.RemoveChange = RemoveChange;
/**
 * Class that does a background work of observing
 * Mongo collection changes (through a cursor)
 * and notifying subscribers about them.
 */
class MongoCursorObserver extends core_1.EventEmitter {
    constructor(cursor, _debounceMs = 50) {
        super();
        this._debounceMs = _debounceMs;
        this._added = [];
        this._lastChanges = [];
        this._ngZone = utils_1.g.Zone.current;
        this._isSubscribed = false;
        utils_1.check(cursor, Match.Where(MongoCursorObserver.isCursor));
        this._cursor = cursor;
    }
    static isCursor(cursor) {
        return cursor && !!cursor.observe;
    }
    subscribe(events) {
        let sub = super.subscribe(events);
        // Start processing of the cursor lazily.
        if (!this._isSubscribed) {
            this._isSubscribed = true;
            this._hCursor = this._processCursor(this._cursor);
        }
        return sub;
    }
    get lastChanges() {
        return this._lastChanges;
    }
    destroy() {
        if (this._hCursor) {
            this._hCursor.stop();
        }
        this._hCursor = null;
    }
    _processCursor(cursor) {
        // On the server side fetch data, don't observe.
        if (Meteor.isServer) {
            let changes = [];
            let index = 0;
            for (let doc of cursor.fetch()) {
                changes.push(this._addAt(doc, index++));
            }
            this.emit(changes);
            return null;
        }
        let hCurObserver = this._startCursorObserver(cursor);
        return new cursor_handle_1.CursorHandle(hCurObserver);
    }
    _startCursorObserver(cursor) {
        let changes = [];
        let callEmit = () => {
            this.emit(changes.slice());
            changes.length = 0;
        };
        // Since cursor changes are now applied in bulk
        // (due to emit debouncing), scheduling macro task
        // allows us to use MeteorApp.onStable,
        // i.e. to know when the app is stable.
        let scheduleEmit = () => {
            return this._ngZone.scheduleMacroTask('emit', callEmit, null, lang_1.noop);
        };
        let init = false;
        let runTask = task => {
            task.invoke();
            this._ngZone.run(lang_1.noop);
            init = true;
        };
        let emit = null;
        if (this._debounceMs) {
            emit = utils_1.debounce(task => runTask(task), this._debounceMs, scheduleEmit);
        }
        else {
            let initAdd = utils_1.debounce(task => runTask(task), 0, scheduleEmit);
            emit = () => {
                // This is for the case when cursor.observe
                // is called multiple times in a row
                // when the initial docs are being added.
                if (!init) {
                    initAdd();
                    return;
                }
                runTask(scheduleEmit());
            };
        }
        return utils_1.gZone.run(() => cursor.observe({
            addedAt: (doc, index) => {
                let change = this._addAt(doc, index);
                changes.push(change);
                emit();
            },
            changedAt: (nDoc, oDoc, index) => {
                let change = this._updateAt(nDoc, index);
                changes.push(change);
                emit();
            },
            movedTo: (doc, fromIndex, toIndex) => {
                let change = this._moveTo(doc, fromIndex, toIndex);
                changes.push(change);
                emit();
            },
            removedAt: (doc, atIndex) => {
                let change = this._removeAt(atIndex);
                changes.push(change);
                emit();
            }
        }));
    }
    _updateAt(doc, index) {
        return new UpdateChange(index, doc);
    }
    _addAt(doc, index) {
        let change = new AddChange(index, doc);
        return change;
    }
    _moveTo(doc, fromIndex, toIndex) {
        return new MoveChange(fromIndex, toIndex);
    }
    _removeAt(index) {
        return new RemoveChange(index);
    }
}
exports.MongoCursorObserver = MongoCursorObserver;

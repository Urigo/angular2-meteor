'use strict';
const rxjs_1 = require('rxjs');
function zone(zone) {
    return this.lift(new ZoneOperator(zone || Zone.current));
}
exports.zone = zone;
class ZoneOperator {
    constructor(zone) {
        this.zone = zone;
    }
    call(subscriber, source) {
        return source._subscribe(new ZoneSubscriber(subscriber, this.zone));
    }
}
class ZoneSubscriber extends rxjs_1.Subscriber {
    constructor(destination, zone) {
        super(destination);
        this.zone = zone;
    }
    _next(value) {
        this.zone.run(() => {
            this.destination.next(value);
        });
    }
    _error(err) {
        this.zone.run(() => {
            this.destination.error(err);
        });
    }
}
rxjs_1.Observable.prototype.zone = zone;

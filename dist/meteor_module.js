'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const lang_1 = require('@angular/core/src/facade/lang');
const utils_1 = require('./utils');
const data_observer_1 = require('./data_observer');
const providers_1 = require('./providers');
const appRegistry = new Map();
let MeteorModule = class {
    constructor(appRef) {
        appRegistry.set(appRef, new MeteorApp(appRef));
    }
};
MeteorModule = __decorate([
    core_1.NgModule({
        providers: [
            ...providers_1.METEOR_PROVIDERS,
            core_1.provide(MeteorApp, {
                deps: [core_1.ApplicationRef],
                useFactory: appRef => {
                    return appRegistry.get(appRef);
                }
            })
        ]
    }), 
    __metadata('design:paramtypes', [core_1.ApplicationRef])
], MeteorModule);
exports.MeteorModule = MeteorModule;
// Contains utility methods useful for the integration. 
let MeteorApp = class {
    constructor(appRef) {
        this.appRef = appRef;
        this._appCycles = new AppCycles(appRef);
    }
    onRendered(cb) {
        utils_1.check(cb, Function);
        this._appCycles.onStable(() => {
            data_observer_1.DataObserver.onReady(() => {
                this._appCycles.onStable(cb);
            });
        });
    }
    onStable(cb) {
        this._appCycles.onStable(cb);
    }
    get ngZone() {
        return this.appRef.zone;
    }
};
MeteorApp = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [core_1.ApplicationRef])
], MeteorApp);
exports.MeteorApp = MeteorApp;
// To be used to detect an Angular 2 app's change detection cycles.
class AppCycles {
    constructor(_appRef) {
        this._appRef = _appRef;
        this._isZoneStable = true;
        this._onStableCb = [];
        this._ngZone = this._appRef.zone;
        this._watchAngularEvents();
    }
    isStable() {
        return this._isZoneStable && !this._ngZone.hasPendingMacrotasks;
    }
    onStable(cb) {
        utils_1.check(cb, Function);
        this._onStableCb.push(cb);
        this._runIfStable();
    }
    dispose() {
        if (this._onUnstable) {
            this._onUnstable.dispose();
        }
        if (this._onStable) {
            this._onStable.dispose();
        }
    }
    _watchAngularEvents() {
        this._onUnstable = this._ngZone.onUnstable.subscribe({ next: () => {
                this._isZoneStable = false;
            }
        });
        this._ngZone.runOutsideAngular(() => {
            this._onStable = this._ngZone.onStable.subscribe({ next: () => {
                    lang_1.scheduleMicroTask(() => {
                        this._isZoneStable = true;
                        this._runIfStable();
                    });
                }
            });
        });
    }
    _runIfStable() {
        if (this.isStable()) {
            lang_1.scheduleMicroTask(() => {
                while (this._onStableCb.length !== 0) {
                    (this._onStableCb.pop())();
                }
            });
        }
    }
}
exports.AppCycles = AppCycles;

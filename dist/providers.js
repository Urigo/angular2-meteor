'use strict';
const core_1 = require('@angular/core');
const mongo_cursor_differ_1 = require('./mongo_cursor_differ');
const change_detection_1 = require('@angular/core/src/change_detection/change_detection');
function meteorProviders() {
    let providers = [];
    let factories = change_detection_1.defaultIterableDiffers.factories;
    if (factories) {
        factories.push(new mongo_cursor_differ_1.MongoCursorDifferFactory());
    }
    providers.push(core_1.provide(core_1.IterableDiffers, {
        useValue: new core_1.IterableDiffers(factories)
    }));
    return providers;
}
exports.METEOR_PROVIDERS = meteorProviders();

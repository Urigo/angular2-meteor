'use strict';
const utils_1 = require('./utils');
/**
 * A class to extend in Angular 2 components.
 * Contains wrappers over main Meteor methods,
 * that does some maintenance work behind the scene.
 * For example, it destroys subscription handles
 * when the component is being destroyed itself.
 */
class MeteorComponent {
    constructor() {
        this._hAutoruns = [];
        this._hSubscribes = [];
        this._ngZone = utils_1.g.Zone.current;
    }
    /**
     * Method has the same notation as Meteor.autorun
     * except the last parameter.
     * @param {Function} func - Callback to be executed when
     *   current computation is invalidated.
     * @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     * @returns {Tracker.Computation} - Object representing the Meteor computation
     * @see {@link https://docs.meteor.com/api/tracker.html#tracker_computation|Tracker.Computation}
     */
    autorun(func, autoBind = true) {
        let autorunCall = () => {
            return Tracker.autorun(func);
        };
        // If autoBind is set to false then
        // we run Meteor method in the global zone
        // instead of the current Angular 2 zone.
        let zone = autoBind ? this._ngZone : utils_1.gZone;
        let hAutorun = zone.run(autorunCall);
        this._hAutoruns.push(hAutorun);
        return hAutorun;
    }
    /**
     *  Method has the same notation as Meteor.subscribe:
     *    subscribe(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the publication.
     *  @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     *  @returns {Meteor.SubscriptionHandle} - The handle of the subscription created by Meteor.
     *  @see {@link http://docs.meteor.com/api/pubsub.html|Meteor.SubscriptionHandle}
     */
    subscribe(name, ...args) {
        let { pargs, autoBind } = this._prepArgs(args);
        if (!Meteor.subscribe) {
            throw new Error('Meteor.subscribe is not defined on the server side');
        }
        let subscribeCall = () => {
            return Meteor.subscribe(name, ...pargs);
        };
        let zone = autoBind ? this._ngZone : utils_1.gZone;
        let hSubscribe = zone.run(subscribeCall);
        if (Meteor.isClient) {
            this._hSubscribes.push(hSubscribe);
        }
        if (Meteor.isServer) {
            let callback = pargs[pargs.length - 1];
            if (_.isFunction(callback)) {
                callback();
            }
            if (utils_1.isCallbacksObject(callback)) {
                callback.onReady();
            }
        }
        return hSubscribe;
    }
    /**
     *  Method has the same notation as Meteor.subscribe:
     *    subscribe(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the method.
     *  @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     */
    call(name, ...args) {
        let { pargs, autoBind } = this._prepArgs(args);
        let meteorCall = () => {
            Meteor.call(name, ...pargs);
        };
        let zone = autoBind ? this._ngZone : utils_1.gZone;
        return zone.run(meteorCall);
    }
    ngOnDestroy() {
        for (let hAutorun of this._hAutoruns) {
            hAutorun.stop();
        }
        for (let hSubscribe of this._hSubscribes) {
            hSubscribe.stop();
        }
        this._hAutoruns = null;
        this._hSubscribes = null;
    }
    _prepArgs(args) {
        let lastParam = args[args.length - 1];
        let penultParam = args[args.length - 2];
        let autoBind = true;
        if (_.isBoolean(lastParam) &&
            utils_1.isMeteorCallbacks(penultParam)) {
            args.pop();
            autoBind = lastParam !== false;
        }
        return { pargs: args, autoBind: autoBind };
    }
}
exports.MeteorComponent = MeteorComponent;

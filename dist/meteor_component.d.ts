import { OnDestroy } from '@angular/core';
/**
 * The built in string object.
 * @external Tracker.Computation
 * @see {@link https://docs.meteor.com/api/tracker.html#tracker_computation}
 */
/**
 * A class to extend in Angular 2 components.
 * Contains wrappers over main Meteor methods,
 * that does some maintenance work behind the scene.
 * For example, it destroys subscription handles
 * when the component is being destroyed itself.
 */
export declare class MeteorComponent implements OnDestroy {
    private _hAutoruns;
    private _hSubscribes;
    private _ngZone;
    /**
     * Method has the same notation as Meteor.autorun
     * except the last parameter.
     * @param {Function} func - Callback to be executed when
     *   current computation is invalidated.
     * @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     * @returns {Tracker.Computation} - Object representing the Meteor computation
     */
    autorun(func: (c: Tracker.Computation) => any, autoBind?: Boolean): Tracker.Computation;
    /**
     *  Method has the same notation as Meteor.subscribe:
     *    subscribe(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the publication.
     *  @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     *  @returns {Meteor.SubscriptionHandle} - The handle of the subscription created by Meteor.
     */
    subscribe(name: string, ...args: any[]): Meteor.SubscriptionHandle;
    /**
     *  Method has the same notation as Meteor.subscribe:
     *    subscribe(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the method.
     *  @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     */
    call(name: string, ...args: any[]): any;
    ngOnDestroy(): void;
    private _prepArgs(args);
}

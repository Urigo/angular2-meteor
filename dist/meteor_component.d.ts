import { OnDestroy } from '@angular/core';
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
     * @param {MeteorComponent~autorunCallback} func - Callback to be executed when current computation is
     * invalidated. The Tracker.Computation object will be passed as argument to
     * this callback.
     * @param {Boolean} autoBind - Determine whether Angular2 Zone will run
     *   after the func call to initiate change detection.
     * @returns {Tracker.Computation} - Object representing the Meteor computation
     * @example
     * class MyComponent extends MeteorComponent {
     *    private myData: Mongo.Cursor;
     *    private dataId: any;
     *
     *    constructor() {
     *      super();
     *
     *      this.autorun(() => {
     *        this.myData = MyCollection.find({ _id: dataId});
     *      }, true);
     *    }
     * }
     *
     * @see {@link https://docs.meteor.com/api/tracker.html#tracker_computation|Tracker.Computation in Meteor documentation}
     * @see {@link https://docs.meteor.com/api/tracker.html#Tracker-autorun|autorun in Meteor documentation}
     */
    autorun(func: (computation: Tracker.Computation) => any, autoBind?: Boolean): Tracker.Computation;
    /**
     *  Method has the same notation as Meteor.subscribe:
     *    subscribe(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the publication.
     *  @param {Boolean} autoBind - Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     *  @returns {Meteor.SubscriptionHandle} - The handle of the subscription created by Meteor.
     *  @example
     *  class MyComponent extends MeteorComponent {
     *     constructor() {
     *       super();
     *
     *       this.subscribe("myData", 10);
     *     }
     *  }
     *
     *  @see {@link http://docs.meteor.com/api/pubsub.html|Publication/Subscription in Meteor documentation}
     */
    subscribe(name: string, ...args: any[]): Meteor.SubscriptionHandle;
    /**
     *  Method has the same notation as Meteor.call:
     *    call(name, [args1, args2], [callbacks], [autoBind])
     *  except the last autoBind param (see autorun above).
     *  @param {String} name - Name of the publication in the Meteor server
     *  @param {any} args - Parameters that will be forwarded to the method.
     *  @param {Boolean} autoBind - autoBind Determine whether Angular 2 zone will run
     *   after the func call to initiate change detection.
     *  @example
     *  class MyComponent extends MeteorComponent {
     *     constructor() {
     *       super();
     *
     *       this.call("serverMethod", (err, result) => {
     *          // Handle response...
     *       });
     *     }
     *  }
     *
     *  @return {void}
     */
    call(name: string, ...args: any[]): any;
    ngOnDestroy(): void;
    private _prepArgs(args);
}

// =========================================================================
// PBS Admin Controllers
// =========================================================================

(function () {
    'use strict';

    var app = angular.module('pbs');

    app.factory('constantService', function () {
        return {
            DockUnitStatus: {
                OPERATIONAL: 0,
                NON_OPERATIONAL: 1,
                SCHEDULED_MAINTENANCE: 2,
                UNSCHEDULED_MAINTENANCE: 3,
                SHUTDOWN: -1

            },

            BicycleStatus: {
                OPERATIONAL: 0,
                UNDER_REDISTRIBUTION: 1,
                AT_HOLDING_AREA: 2,
                UNDER_MAINTENANCE: 3,
                TEMPORARILY_SUSPENDED: 4,
                IN_STORAGE: 5,
                REMOVED_FROM_SERVICE: -1
            },

            BicycleLocation: {
                DOCKED: 0,
                WITH_A_USER: 1,
                ON_REDISTRIBUTION_VEHICLE: 2,
                AT_HOLDING_AREA: 3,
                OUT_FOR_MAINTENANCE: 4,
                BEING_TRANSPORTED: 5
            }

        }
    });

})();

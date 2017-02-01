// =========================================================================
// PBS Admin Services
// =========================================================================

(function () {
    'use strict';

    var app = angular.module("pbs");

    app.factory('DataService', ['$http', '$q', 'APIEndPoint', 'API','APINew', function ($http, $q, APIEndPoint, API,APINew) {
        return {
            signup:  function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.signup.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getMembers: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.getAll, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveMember: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            verifyDocument: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.member.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateMembershipForMember: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.update + '/' + data._id + '/' + APIEndPoint.member.membershipForMember, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateSmartCardForMember: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.update + '/' + data._id + '/' + APIEndPoint.member.smartCardForMember, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            addCredit: function (id, data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.credit, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            addDebit: function (id, data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.debit, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

           /* cancelMember:function(id){
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.cancel, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },*/

           /*membership cancel request*/
            cancelRequest: function (id) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.request, {
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*membership cancel*/
            cancelMembership: function (id, data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.cancel, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            suspendMember:function(id,data){
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.member.save + '/' + id + '/' + APIEndPoint.member.suspend, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getMember: function (data, filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.get + '/' + data, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateMember: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.member.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getEmployees: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.employee.getAll + '/' , {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            testConnectionForIP: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingStations.testConnection, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveDockingStationWithOutSync: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.dockingStations.post, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveDockingStationWithSync: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingStations.sync, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getEmployee: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.employee.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveEmployee: function (data) {
                var deferred = $q.defer();
                var _department = data.department;
                var _url;
                if (_department  === 'Registration Member Staff')
                {
                    _url = 'registrationstaff';
                }
                else if (_department === 'Redistribution Member Staff')
                {
                    _url = 'rvstaff';
                }
                else if (_department === 'Maintenance Center Staff')
                {
                    _url = 'mcstaff';
                }
                else if (_department === 'Information Technology Staff')
                {
                }
                else if (_department === 'Office Staff')
                {
                }
                else if (_department === 'Docking Station Repair Staff')
                {
                }
                else if (_department === 'Holding Area Staff')
                {
                    _url='hastaff';
                }
                else if (_department === 'Operator')
                {
                    _url='operator';
                }
                else if (_department === 'Accounts Admin')
                {
                    _url='accountstaff';
                }
                else if (_department === 'Monitor Group')
                {
                    _url='monitorgrp';
                }
                else
                {

                }

                $http.post(APINew + APIEndPoint.employee.save + '/' + _url  , data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            verifyDocumentEmployee: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.employee.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateEmployee: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.employee.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveChangePassword: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.user.user + '/' + data._id + '/' + APIEndPoint.user.password, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateSmartCardForEmployee: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.employee.update + '/' + data._id + '/' + APIEndPoint.employee.smartCardForEmployee, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getMemberships: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.membership.getAll, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getMembership: function (data, filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.membership.get + '/' + data, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveMembership: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.membership.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateMembership: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.membership.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getDockingStations: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.dockingStations.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getStationsCount: function () {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.dockingStations.count).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveDockingStation: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingStations.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },
            getDockingStation: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.dockingStations.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateDockingStation: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.dockingStations.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

           /* getRedistributionVehicle: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.dockingStations.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },*/

            getDockingUnits: function (filters) {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.dockingUnits.getAll,
                    {
                        params: filters
                    }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getDockingUnit: function (data, filters) {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.dockingUnits.get + '/' + data, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveDockingUnit: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingUnits.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateDockingUnit: function (data) {
                var deferred = $q.defer();
                $http.put(API + APIEndPoint.dockingUnits.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getDockingPorts: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.dockingPorts.getAll,
                    {
                        params: filters
                    }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getDockingPort: function (data, filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.dockingPorts.get + '/' + data, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveDockingPort: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingPorts.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateDockingPort: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.dockingPorts.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getBicycles: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.vehicle.getAll, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveBicycle: function (data) {
                var deferred = $q.defer();
               /* $http.post(APINew + APIEndPoint.bicycle.save, data).then(function (result) {*/
                 $http.post(APINew + APIEndPoint.vehicle.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getBicycle: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.vehicle.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getBicycleRFID: function (filter) {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.bicycle.get, {
                    params: filter
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateBicycle: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.vehicle.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getRedistributionVehicles: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.redistributionVehicles.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getRedistributionStations: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.redistributionStations.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getMaintenanceStations: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.maintenanceStations.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getHoldingStations: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.HoldingStation.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getFleetsStations: function () {
            var deferred = $q.defer();
            $http.get(APINew + APIEndPoint.fleetStations.getAll).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

            saveRedistributionVehicle: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.redistributionVehicles.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getRedistributionVehicle: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.redistributionVehicles.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateRedistributionVehicle: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.redistributionVehicles.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveFleets: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.fleets.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getFarePlans: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.farePlan.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getStaffs: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.staffSelection.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getRedistributionVehicleStaff:function(){
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.redistributionVehicleStaffSelection.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveFarePlan: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.farePlan.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getFarePlan: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.farePlan.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateFarePlan: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.farePlan.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getHoldingAreas: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.holdingArea.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getFleetAreas: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.fleets.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getFleets: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.fleet.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getFleet: function (data) {
            var deferred = $q.defer();
            $http.get(APINew + APIEndPoint.fleet.get + '/' + data).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        saveHoldingArea: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.holdingArea.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveFleet: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.fleetDetails.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            othergetFleets: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.fleetDetails.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveMaintenanceCentreinternal: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.internalMaintenanceCentre.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getMaintenanceCenterinternal: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.internalMaintenanceCentre.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveInternalstaions: function (data) {
                var center_url;
                var _stationType= data.type;
                if(_stationType === "Fleet")
                {
                    center_url="fleetarea";
                }
                else if(_stationType === "Maintenance Centre")
                {
                    center_url="maintenancecenter";
                }
                else if(_stationType === "Holding Area")
                {
                    center_url="holdingarea";
                }
                else if(_stationType === "Redistribution Centre")
                {
                    center_url="redistributionvehicle";
                }
                var deferred = $q.defer();
                var newdata={
                    name:data.name,
                    gpsCoordinates:
                        {
                        latitude: data.gpsCoordinates.latitude,
                        longitude: data.gpsCoordinates.longitude
                    }
                };
                $http.post(APINew  + center_url , newdata).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getInternalStations: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.internalStations.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getHoldingArea: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.holdingArea.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateHoldingArea: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.holdingArea.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getMaintenanceCentres: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.maintenanceCentre.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveMaintenanceCentre: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.maintenanceCentre.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

         /*   getRegistrationCentre: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.registrationCentre.get + '/' + data).then(function (result) {
                    $http.get(APINew + APIEndPoint.registrationCentre.get + '/' + data).then(function (result) {
                        deferred.resolve(result.data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            },*/

            getRegistrationCentres: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.registrationCentre.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getRegistrationCentre: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.registrationCentre.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateRegistrationCentre: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.registrationCentre.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*bank cash deposit details*/
            getBankCashDepositDetails: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.bankCashDeposit.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*Registration Centres*/
            saveRegistrationCentre: function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.registrationCentre.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*Input details for docking station clean report*/
            sendDockingStationCleanInputsDetails:function (data) {
            if(data.location == "" || data.location == null || data.location == undefined)
            {
                data.location = "All"
            }
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.dockingStationClean.send,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*docking station cleaning */
            saveDockingStationCleaning: function (data) {
                var _enteredDate=data.cleaneddate;
                var _enteredTimeFrom = data.fromtime;
                var _enteredTimeTo= data.totime;

                var _date =_enteredDate.getDate();
                if(_date.toString().length === 1)
                {
                    _date=0 +""+_enteredDate.getDate();
                }
                else
                {
                    _date=_enteredDate.getDate();
                }
                var _month=_enteredDate.getMonth();
                var new_month=_month+1;
                if(new_month.toString().length === 1)
                {
                    new_month=0+""+new_month;
                }
                else
                {
                    new_month;
                }
                var _year=_enteredDate.getFullYear();
                var Date=_year+"-"+new_month+"-"+_date;
               /* var _timeFrom = Date+"T"+_enteredTimeFrom+":"+"00"+":"+"000"+"Z";
                var _timeTo =   Date+"T"+_enteredTimeTo+":"+"00"+":"+"000"+"Z";*/
                var _timeFrom = Date+"T"+_enteredTimeFrom+"Z";
                var _timeTo = Date+"T"+_enteredTimeTo+"Z";

               /* var _timeTo = Date+"T"+_enteredTimeTo+":"+"00"+":"+"000"+"Z";*/
                var deferred = $q.defer();
                var CleanDockingStation={
                    stationId:data.stationId,
                    stationIdnew:data.stationIdnew,
                    cleaneddate:data.cleaneddate,
                    fromtime:_timeFrom,
                    totime:_timeTo,
                    empId:data.empId,
                    description:data.description,
                    createdBy:data.createdBy
                };
                $http.post(APINew + APIEndPoint.dockingStationCleaning.save, CleanDockingStation).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getDockingStationCleaningDetails: function () {
            var deferred = $q.defer();
            $http.get(APINew + APIEndPoint.dockingStationCleaning.getAll).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
            },

            sendBicycleMaintenanceDetails:function (data) {
            var deferred = $q.defer();
            $http.post(API + APIEndPoint.bicycleMaintenance.send,data).then(function (result) {
                deferred.resolve(result.data);
            },function (error) {
                deferred.reject(error)
            });
            return deferred.promise;
            },

            /*Registration details*/
            SendRegistrationDetails:function (data) {
              var deferred = $q.defer();
                $http.post(API + APIEndPoint.registrationDetails.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*Refunds Details (post)*/
            SendRefundDetails:function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.refundDetails.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*Cash Collection Details*/
            SendCashCollectionDetails:function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.cashCollection.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*Daywise cash collections*/
            SendDaywiseCashCollectionDetails:function (data) {
                if(data.location == "" || data.location == null || data.location == undefined)
                {
                    data.location = "All"
                }
                var deferred = $q.defer();
                var _transaction_type = data.transactionType;
                var test;
                if (_transaction_type  === 'Registration')
                {
                    test = 'Registration'
                }
                if (_transaction_type  === 'Refunds')
                {
                    test = 'Refunds'
                }
                var daywiseCollection = {
                    fromdate:data.fromdate,
                    todate:data.todate,
                    location:data.location,
                    transactionType : test
                };
                $http.post(APINew + APIEndPoint.daywiseCollection.getAll,daywiseCollection).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*Total Cash Details*/
            SendTotalCashCollectionDetails:function (data) {
                if(data.location == "" || data.location == null || data.location == undefined)
                {
                    data.location = "All";
                }
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.totalCashCollection.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

         /*   /!*Total Cash Details Print*!/
            SendTotalCashCollectionDetailsPrint:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.totalCashCollection.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },*/

            SendBankCashDepositDetails:function (data) {
                if(data.location == "" || data.location == null || data.location == undefined)
                {
                    data.location="All";
                }
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.bankCashDepositReport.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            /*Bank cash deposit details*/
            saveBankCashDepositDetails:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.bankCashDeposit.save,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            // Global key names and values
            saveGlobalKeyNameValue:function (data) {
                var name = data.name;
                var value=[];
                for (var i= 0 ;i< data.value.length ;i++)
                {
                    value.push(data.value[i].value);
                }
                var globalKeyNameValueNew = {
                    name:data.name,
                   value:value
                };
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.globalKeyNameValue.save,globalKeyNameValueNew).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            // Get all Global names and values
            getGlobalKeyNameValues: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.globalKeyNameValue.getAll).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getSettingType: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.globalKeyNameValue.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*KPI details*/
            SendKPIDetails:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.kpiDetails.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            GetRVDetails:function (data) {
                var deferred = $q.defer();
                 $http.post(APINew + APIEndPoint.kpiDetails.getAll,data).then(function (result) {
                 deferred.resolve(result.data);
                 },function (error) {
                 deferred.reject(error)
                 });
                 return deferred.promise;
            },

            GetKPISmartCardReport:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.kpiSmartCardDetails.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            GetBicycleDetailsAtFleet:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.kpiBicycleAtFleet.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            GetDockingStationKPIDetails:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.kpiDSCleanDetails.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            GetCycleUsagePerDay:function (data) {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.kpiCycleUsagePerDay.getAll,data).then(function (result) {
                    deferred.resolve(result.data);
                },function (error) {
                    deferred.reject(error)
                });
                return deferred.promise;
            },

            GetSmartCardAtKiosks:function (data) {
            var deferred = $q.defer();
            $http.post(APINew + APIEndPoint.kpiSmartCardKiosks.getAll,data).then(function (result) {
                deferred.resolve(result.data);
            },function (error) {
                deferred.reject(error)
            });
            return deferred.promise;
        },

            saveTicketDetails:function(data)
            {
                var deferred = $q.defer();
               /* $http.post(API + APIEndPoint.ticketsDetails.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;*/
            },

            // search member to raise a ticket
            memberSearch:function(data)
            {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.searchmember.send, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /*check in check out*/
            saveCheckInCheckOut:function(data)
            {
                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.checkIncheckOut.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveCheckIn:function(data)
            {
                var deferred = $q.defer();
                var _toPort = data.fromPort;
                var CheckIn = {
                    cardId:data.cardId,
                    vehicleId:data.vehicleId,
                    toPort:data.fromPort,
                    checkInTime : new Date()
                };
                $http.post(APINew + APIEndPoint.checkIn.save, CheckIn).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveCheckOutBridge:function(data)
            {
                var currentDate = data.checkOutTime;
                var enteredDate = data.bridgeDate;
                var enterTime=data.bridgeTime;
                var _Date= enteredDate.getDate();
                if (_Date.toString().length === 1)
                {
                    _Date = 0 + "" + enteredDate.getDate();
                }
                else
                {
                    _Date= enteredDate.getDate();
                }
                var _Month = enteredDate.getMonth()+1;
                if (_Month.toString().length === 1)
                {
                    _Month = 0 + "" + enteredDate.getMonth();
                }
                else
                {
                    _Month= enteredDate.getMonth();
                }
                var _Year=enteredDate.getFullYear();
                var Date= _Year + "-" + _Month + "-" + _Date;
                var _Hour = enteredDate.getHours(2);
                var _Minutes= enteredDate.getMinutes(2);
                var _Seconds=enteredDate.getSeconds(2);
                var _Miliseconds=enteredDate.getMilliseconds();
                var Time=_Hour + ":" + _Minutes + ":" + _Seconds + ":" + _Miliseconds;
                var Date_Time = Date + "T" + enterTime + "Z";
                var deferred = $q.defer();

                var checkOutBridge={
                    vehicleId:data.vehicleId,
                    cardId:data.cardId,
                    fromPort:data.fromPort,
                    checkOutTime:Date_Time
                };
               /* $http.post(APINew + APIEndPoint.checkOutBridge.save, checkOutBridge).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;*/
            },

            saveCheckInBridge:function(data)
            {
                var enteredDate = data.bridgeDate;
                var enterTime=data.bridgeTime;
                var _Date= enteredDate.getDate();
                if (_Date.toString().length === 1)
                {
                    _Date = 0 + "" + enteredDate.getDate();
                }
                else
                {
                    _Date= enteredDate.getDate();
                }
                var _Month = enteredDate.getMonth()+1;
                if (_Month.toString().length === 1)
                {
                    _Month = 0 + "" + enteredDate.getMonth();
                }
                else
                {
                    _Month= enteredDate.getMonth();
                }
                var _Year=enteredDate.getFullYear();
                var Date= _Year + "-" + _Month + "-" + _Date;
                var _Hour = enteredDate.getHours(2);
                var _Minutes= enteredDate.getMinutes(2);
                var _Seconds=enteredDate.getSeconds(2);
                var _Miliseconds=enteredDate.getMilliseconds();
                var Time=_Hour + ":" + _Minutes + ":" + _Seconds + ":" + _Miliseconds;
                var Date_Time = Date + "T" + enterTime + "Z";
                var deferred = $q.defer();
                var _toPort = data.fromPort;
                var CheckIn = {
                    cardId:data.cardId,
                    vehicleId:data.vehicleId,
                    toPort:data.fromPort,
                    checkInTime : Date_Time
                };
                $http.post(APINew + APIEndPoint.checkInBridge.save, CheckIn).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },


            getMaintenanceCentre: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.maintenanceCentre.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateMaintenanceCentre: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.maintenanceCentre.update + '/' + data._id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getSmartCards: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.smartCard.getAll, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            verifyCardForMember: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.smartCard.verifyForMember, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            verifyCardForEmployee: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.smartCard.verifyForEmployee, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            deactivateCard: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.smartCard.update + '/' + data + '/' + APIEndPoint.smartCard.deactivate).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            saveSmartCard: function (data) {

                var deferred = $q.defer();
                $http.post(APINew + APIEndPoint.smartCard.save, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getSmartCard: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.smartCard.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateSmartCard: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.smartCard.update + '/' + data.id, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getAllMemberTransactions: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.reports.transactions.getAll, {params: filters}).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getMemberTransaction: function (data) {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.reports.transactions.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getRidesAdmin: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberTransaction + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

           /* getRidesUser: function (data,filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberTransaction + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },*/

            getRidesUser: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberTransaction + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getUserPayment: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberIndividualPaymentTransation + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getUserDetails:function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.get + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveUserFeedback: function (data) {
            var deferred = $q.defer();
            $http.post(APINew + APIEndPoint.feedback.save, data).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
            },

            saveNewPassword: function (data) {
            var deferred = $q.defer();
            $http.put(APINew + "users/" + data.uid + "/password/change" ,  data).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
            },

            getMemberPaymentTransaction: function (filters) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberPaymentTransaction, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getMemberPaymentTransaction1: function (data) {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.member.memberIndividualPaymentTransation + '/' + data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            saveMemberTransaction: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.reports.transactions.checkOut, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateMemberTransaction: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.reports.transactions.checkIn, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            initiateSync: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.bicycle.initiateSync, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getBicycleAvailability: function () {
                var deferred = $q.defer();
                $http.get(APINew + APIEndPoint.bicycle.bicycleAvailabilityLocal).then(function (result)
                {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getBicycleLifeCycle: function (filters) {
                var deferred = $q.defer();
                $http.get(API + APIEndPoint.bicycle.bicycleLifeCycle, {
                    params: filters
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            moveBicycle: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.bicycle.moveBicycle, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            postCloseTransaction: function (data) {
                var deferred = $q.defer();
                $http.post(API + APIEndPoint.closeTransaction.post, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            forgotPassword: function (data) {
                var deferred = $q.defer();
                $http.put(APINew + APIEndPoint.user.forgotPassword, data).then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        }

    }]);

    app.factory('StatusService', ['APINew', function (APINew) {
        return {
            getDockingStationStatus: function (code) {
                var status = '';
                switch (code) {
                    case 1:
                        status = "Operational";
                        break;
                    case 2:
                        status = "Non Operational";
                        break;
                    case -1:
                        status = "Decommissioned";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getDockingUnitsStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Operational";
                        break;
                    case  1:
                        status = "Non Operational";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getTransactionStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "In Progress";
                        break;
                    case  1:
                        status = "Completed";
                        break;
                    case  -1:
                        status = "Canceled";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getDockingPortStatus: function (code) {
                var status = '';
                switch (code) {
                    case  1:
                        status = "Bicycle Available";
                        break;
                    case  2:
                        status = "Empty Port";
                        break;
                    case  -1:
                        status = "Port Error";
                        break;
                   /* case  3:
                        status = "Port Locked";
                        break;
                    case  4:
                        status = "Port Error";
                        break;*/
                    default:
                        break;
                }
                return status;
            },
            getRedistributionVehicleStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "On Road";
                        break;
                    case  1:
                        status = "At Brake";
                        break;
                    case  2:
                        status = "At Waiting Area";
                        break;
                    case  3:
                        status = "Miscellaneous Tasks";
                        break;
                    case  -1:
                        status = "Non Operational";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getBicycleStatus: function (code) {
                var status = '';
                switch (code) {
                    case  1:
                        status = "Operational";
                        break;
                    case  2:
                        status = "Non-Operational";
                        break;
                    case  3:
                        status = "Decommissioned";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getBicycleLocation: function (code) {
                var location = '';
                switch (code) {
                    case  0:
                        location = "Docked";
                        break;
                    case  1:
                        location = "With a User";
                        break;
                    case  2:
                        location = "On Redistribution Vehicle";
                        break;
                    case  3:
                        location = "Holding Area";
                        break;
                    case  4:
                        location = "Out for Maintenance";
                        break;
                    case  5:
                        location = "Temporary Port";
                        break;
                    default:
                        break;
                }
                return location;
            },
            getBicycleLocationNumber: function (code) {
                var location = '';
                switch (code) {
                    case  "Docked":
                        location = 0;
                        break;
                    case  "With a User":
                        location = 1;
                        break;
                    case  "On Redistribution Vehicle":
                        location = 2;
                        break;
                    case  "Holding Area":
                        location = 3;
                        break;
                    case  "Out for Maintenance":
                        location = 4;
                        break;
                    case  "Temporary Port":
                        location = 5;
                        break;
                    default:
                        break;
                }
                return location;
            },
            getHoldingAreaStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Operational";
                        break;
                    case  1:
                        status = "Non Operational";
                        break;
                    case -1:
                        status = "Shutdown";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getMaintenanceCentresStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Operational";
                        break;
                    case  1:
                        status = "Non Operational";
                        break;
                    case -1:
                        status = "Shutdown";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getRegistrationCentresStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Operational";
                        break;
                    case  1:
                        status = "Non Operational";
                        break;
                    case -1:
                        status = "Shutdown";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getSmartCardStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Active";
                        break;
                    case -1:
                        status = "Inactive";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getMembershipStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Active";
                        break;
                    case -1:
                        status = "Inactive";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getFarePlanStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Active";
                        break;
                    case -1:
                        status = "Inactive";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getMemberStatus: function (code) {
                var status = '';
                switch (code) {
                    case  0:
                        status = "Prospective";
                        break;
                    case  1:
                        status = "Registered";
                        break;
                    case  2:
                        status = "Renewed";
                        break;
                    case  -1:
                        status = "Cancelled";
                        break;
                    case  -2:
                        status = "Suspended";
                        break;
                    default:
                        break;
                }
                return status;
            },
            getCardType: function (code) {
                var cardType = '';
                switch (code) {
                    case  0:
                        cardType = "Registered Member";
                        break;
                    case  1:
                        cardType = "Employee Card";
                        break;
                    default:
                        break;
                }
                return cardType;
            },
            getCardLevel: function (code) {
                var cardLevel = '';
                switch (code) {
                    case  0:
                        cardLevel = "Regular Employee Card";
                        break;
                    case  1:
                        cardLevel = "Check Out Card";
                        break;
                    case  2:
                        cardLevel = "Port Close Card";
                        break;
                    case  3:
                        cardLevel = "Bicycle Lock Card";
                        break;
                    case  4:
                        cardLevel = "Port Ready Card";
                        break;
                    default:
                        break;
                }
                return cardLevel;
            },
            getCardTypeToNum: function (code) {
                var cardType = '';
                switch (code) {
                    case  "Registered Member":
                        cardType = 0;
                        break;
                    case  "Employee Card":
                        cardType = 1;
                        break;
                    default:
                        break;
                }
                return cardType;
            },
            getCardLevelToNum: function (code) {
                var cardLevel = '';
                switch (code) {
                    case  "Regular Employee Card":
                        cardLevel = 0;
                        break;
                    case  "Check Out Card":
                        cardLevel = 1;
                        break;
                    case  "Port Close Card":
                        cardLevel = 2;
                        break;
                    case  "Bicycle Lock Card":
                        cardLevel = 3;
                        break;
                    case  "Port Ready Card":
                        cardLevel = 4;
                        break;
                    default:
                        break;
                }
                return cardLevel;
            },
            getEmployeeStatus: function (code) {
                var status = '';
                switch (code) {
                    case  1:
                        status = "Active";
                        break;
                    case  0:
                        status = "Inactive";
                        break;
                    case  -1:
                        status = "Blocked";
                        break;
                    default:
                        break;
                }
                return status;
            }
        }
    }]);

    // Login Auth
    app.service('auth', ['$window', '$location', function ($window, $location) {

        var self = this;

        self.saveToken = function (token) {
            $window.localStorage['PBSToken'] = token;
        };

        self.parseToken = function (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        };

        self.getToken = function () {
            return $window.localStorage['PBSToken'];
        };

        self.isAuthed = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };

        self.returnRole = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                /*return params.role;*/
                return params._type;
                return params.email;
            } else {
                return false;
            }
        };

        /*newly added*/
        self.returnEmail=function(){
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                return params.email;
            } else {
                return false;
            }
        };

        self.returnName = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                return params.profileName;
            } else {
                return false;
            }
        };

        self.returnUserId = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                return params.assignedUser;
            } else {
                return false;
            }
        };

        self.returnId = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseToken(token);
                return params.userId;
            } else {
                return false;
            }
        };

        self.logout = function () {
            $window.localStorage.removeItem('PBSToken');
            $window.location.reload();
        };


    }]);


    app.factory('authInterceptor', ['auth', 'API', function (auth, API) {

        return {
            // automatically attach Authorization header
            request: function (config) {
                var token = auth.getToken();
                if (config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            }
        }

    }]);

    app.service('user', ['$http', '$q', 'APINew', function ($http, $q, APINew) {

        var self = this;

        self.login = function (username, password) {
                return $http.post(APINew + 'auth/login', {
                    username: username,
                    password: password
                });
            };
    }]);

    app.service('messageService', ['$resource', function($resource){
        this.getMessage = function(img, user, text) {
            var gmList = $resource("data/messages-notifications.json");

            return gmList.get({
                img: img,
                user: user,
                text: text
            });
        }
    }]);

    app.factory('MyService',function () {
       var saveData={}
        function set(data) {
            saveData=data;
        }
        function get() {
            return savedData;
        }
        return {
            set: set,
            get: get
        }
    });

})();
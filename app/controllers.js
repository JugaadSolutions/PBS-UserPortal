// =========================================================================
// PBS Admin Controllers
// =========================================================================

(function () {
    'use strict';

    var app = angular.module('pbs');

    /*newly added*/
    var login_email;
    var login_id;
    var _login_id;
    var _user_id;
    app.controller('PBSController', ['$scope', '$state', 'auth', 'AWS', '$rootScope', function ($scope, $state, auth, AWS, $rootScope) {

        $scope.$on('userInfo', function (event, user) {
            $scope.profileName = user.profileName;
           /* $scope.admin = user.role !== 'employee';*/
            $scope.admin = user.role == 'member';
            $scope.role = user.role;
            /*newly added*/
            $scope.email=user.email;
            login_id=user.id;
            login_email = user.email;


            //$scope.profilePic = AWS + 'Employee/' + user._id + '/' + member.picture + '.png';

            /*if ($scope.role=="member")
            {
                $state.go("403");
                return false;
            }*/
        });

        $scope.logout = function () {
            auth.logout();
            $state.reload();
        };
    }]);

    //Header Controller
    app.controller('HeaderController', ['$scope', '$state', 'auth', 'growl', '$rootScope', function ($scope, $state, auth, growl, $rootScope) {

        $scope.lvMenuStatFun = function () {
            $scope.lvMenuStat = !$scope.lvMenuStat;
            $rootScope.$broadcast('sideBar', $scope.lvMenuStat);
        };
    }]);

    //Admin Controller
    app.controller('AdminController', ['$scope', '$state', 'auth', 'growl', function ($scope, $state, auth, growl) {

        $scope.$on('sideBar', function (event, data) {
            $scope.sideBar = data;
        })

    }]);
    //403 Controller
    app.controller('403Controller', ['$scope', '$state', 'auth', 'growl', function ($scope, $state, auth, growl) {

    }]);

    //Login Controller
    app.controller('LoginController', ['$state', '$scope', '$rootScope', '$timeout', 'growl', 'user', 'auth', 'DataService', function ($state, $scope, $rootScope, $timeout, growl, user, auth, DataService) {
        $scope.login = true;

        $scope.reg = function () {
            $scope.login = false;
            $scope.forget = false;
        };
        $scope.for = function () {
            $scope.login = false;
            $scope.forget = true;

            $scope.forgot = function (email) {
                var data = {
                    email: email
                };
                DataService.forgotPassword(data).then(function (response) {
                    if (!response.error) {
                        $scope.successForgot = true;
                        $scope.forget = false;

                        growl.success(response.data.message);
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
            };
        };
        $scope.log = function () {
            $scope.login = true;
            $scope.forget = false;
            $scope.successForgot = false;
        };

        $rootScope.$emit('auth');
        $scope.isAuthed = auth.isAuthed();

        var self = this;



        $scope.username = "";
        $scope.password = "";

        function handleRequest(res) {
            var token = res.data.data.token;
            _login_id=res.data.data.id;
            _user_id=res.data.data.uid;
          /*  alert(_login_id);*/
            if (token) {
                auth.saveToken(token);
                $state.reload();
            } else {
                growl.error(res.data.message);
            }
        }

        $scope.loginUser = function (username, password)
        {
            if(username == "" || username == null || password == "" || password == null)
            {
                growl.error("Please enter username and password");
            }
            else
            {
            user.login(username, password)
                .then(handleRequest, handleRequest);
            $state.reload();
            };
        }
    }]);

    // Manage Members Controller
    app.controller('ManageMembers', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS) {
        $scope.membersData = [];
        $scope.memberDocument=[];

        var filters = {
            filter: {
                populate: {path: 'membershipId'}
            }
        };

        login_email;

      /*  $scope.auth(function(response){
            var test=  params.email;
        })*/

        DataService.getMembers(filters).then(function (response) {
            login_email;
            if (!response.error) {
                var i=0;
                $scope.membersData = response.data;
                $scope.membersData.forEach(function (member) {
                    member.status = StatusService.getMemberStatus(member.status);
                    if (!member.picture || member.picture == '') {
                        member.profilePicUrl = 'assets/images/no-avatar.png'
                    } else {
                        member.profilePicUrl = AWS + 'Member/' + member.memberId + '/' + member.picture + '.png';
                    }
                    if (member.membershipId) {
                        member.subscriptionType = member.membershipId.subscriptionType;
                        member.documentNumber = member.documents[i].documentNumber;
                    }
                });
                $scope.membersTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.membersTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.membersData, params.filter()) : $scope.membersData;

                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.changeMemberStatus = function (id) {
            var selectedMember = {};
            $scope.membersData.forEach(function (member) {
                if (member._id === id) {
                    selectedMember = member;
                }
            });
            return $uibModal.open({
                templateUrl: 'member-status-modal.html',
                controller: 'MemberStatus',
                size: 'md',
                resolve: {
                    member: function () {
                        return selectedMember;
                    }
                }
            });
        };

        $scope.editMember = function (id) {
            $state.go('admin.members.edit', {'id': id});
        };

        $scope.addNewMember = function () {
            $state.go('admin.members.add');
        };

        $scope.auth=function(){

        };


    }]);

    // Member Status Controller
    app.controller('MemberStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'member', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, member) {

        $scope.member = member;

        $scope.changeMemberStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.member.status = parseInt($scope.member.status);
                DataService.updateMember($scope.member).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelMemberStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Add Member Controller
    app.controller('AddMember', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.member = {
            Name: '',
            lastName: '',
           /* givenName: '',*/
            fatherName: '',
            education: '',
            occupation: '',
            sex: '',
            phoneNumber: '',
            address: '',
            city: 'Mysore',
            state: 'Karnataka',
            country: 'India',
            countryCode: '91',
            pinCode: '',
            smartCardNumber: '',
            profilePic: '',
            cardNum:'',
            emergencyContact: {countryCode: '91'},
            documents: [],
            smartCardKey:'',
            createdBy:_login_id
        };

        $scope.panCardRegex = '/[A-Z]{5}\d{4}[A-Z]{1}/i';

        $scope.addNewDocument = function () {
            $scope.member.documents.push({});
        };

        $scope.verify = function () {
            var smartCard = {
                cardNumber: $scope.member.smartCardNumber
            };
            DataService.verifyCardForMember(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.removeDocument = function ($index) {
            $scope.member.documents.splice($index, 1);
        };

        $scope.addMember = function () {
            $scope.member.phoneNumber = $scope.member.countryCode + '-' + $scope.member.phoneNumber;
            /*if ($scope.member.emergencyContact.contactNumber) {
                $scope.member.emergencyContact.contactNumber = $scope.member.countryCode + '-' + $scope.member.emergencyContact.contactNumber;
            } else {
                $scope.member.emergencyContact.contactNumber = "";
            }*/
            DataService.saveMember($scope.member).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.members.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.message);
            })
        };

        $scope.cancelAddMember = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.members.manage');
            });
        };

    }]);

    // Edit Member Controller
    app.controller('EditMember', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModal','$filter', 'NgTableParams', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModal, $filter, NgTableParams) {
        $scope.member = {
            countryCode: '91',
            emergencyContact: {countryCode: '91'}
        };

        $scope.addNewDocument = function () {
            $scope.member.documents.push({});
        };

        $scope.removeDocument = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            }, function () {
                $scope.member.phoneNumber = $scope.member.countryCode + '-' + $scope.member.phoneNumber;
                /*if ($scope.member.emergencyContact.contactNumber) {
                    $scope.member.emergencyContact.contactNumber = $scope.member.countryCode + '-' + $scope.member.emergencyContact.contactNumber;
                } else {
                    $scope.member.emergencyContact.contactNumber = "";
                }*/
                $scope.member.documents.splice($index, 1);
                DataService.updateMember($scope.member).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
            });
        };

        $scope.addCredit = function (size) {
            $uibModal.open({
                templateUrl: 'memberCreditModal.html',
                controller: 'CreditModalCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.member.credit;
                    }
                }
            });
        };

        $scope.cancelMembership = function (size) {
            $uibModal.open({
                templateUrl: 'cancelMembership.html',
                controller: 'CancelMembershipModalCtrl',
                size: size,
                resolve: {
                    items: function () {
                    }
                }
            });
        };

       /* $scope.ConfirmCancelMembership = function (size) {
            $uibModal.open({
                templateUrl: 'ConfirmCancelMembership.html',
                controller: 'ConfirmMembershipCancel',
                size: size,
                resolve: {
                    items: function () {
                    }
                }
            });
        };*/

        $scope.Suspend = function (size) {
            $uibModal.open({
                templateUrl: 'suspendMembership.html',
                controller: 'SuspendMembershipModalCtrl',
                size: size,
                resolve: {
                    items: function () {
                        /* return $scope.member.credit;*/
                    }
                }
            });
        };

        $scope.debit = function (size) {
            $uibModal.open({
                templateUrl: 'memberDebitModal.html',
                controller: 'DebitModalCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.member.debit;
                    }
                }
            });
        };

        $scope.verify = function () {
            var smartCard = {
                cardNumber: $scope.member.smartCardNumber
            };
            DataService.verifyCardForMember(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.verifyDocument = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'This will confirm registration for the member',
                type: 'info',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                closeOnConfirm: true
            }, function () {
                $scope.member.status = 1;
                $scope.member.phoneNumber = $scope.member.countryCode + '-' + $scope.member.phoneNumber;
                /*if ($scope.member.emergencyContact.contactNumber) {
                    $scope.member.emergencyContact.contactNumber = $scope.member.countryCode + '-' + $scope.member.emergencyContact.contactNumber;
                } else {
                    $scope.member.emergencyContact.contactNumber = "";
                }*/
                DataService.verifyDocument($scope.member).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.addMembership = function () {
            return $uibModal.open({
                templateUrl: 'membership-modal.html',
                controller: 'MembershipForMember',
                size: 'md',
                resolve: {
                    member: function () {
                        return $scope.member;
                    }
                }
            });
        };

        $scope.addSmartCard = function () {
            return $uibModal.open({
                templateUrl: 'smartCard-modal.html',
                controller: 'SmartCardForMember',
                size: 'md',
                resolve: {
                    member: function () {
                        return $scope.member;
                    }
                }
            });
        };

        $scope.addSmartCard = function () {
            return $uibModal.open({
                templateUrl: 'smartCard-modal.html',
                controller: 'SmartCardForMember',
                size: 'md',
                resolve: {
                    member: function () {
                        return $scope.member;
                    }
                }
            });
        };

        var filters = {
            filter: {
                populate: {path: 'membershipId'}
            }
        };

        $scope.changeMemberStatus = function () {
            return $uibModal.open({
                templateUrl: 'member-status-modal.html',
                controller: 'MemberStatus',
                size: 'md',
                resolve: {
                    member: function () {
                        return $scope.member;
                    }
                }
            });
        };

        DataService.getMember($stateParams.id, filters).then(function (response) {
            if (!response.error) {
                $scope.member = response.data;
                var phone = $scope.member.phoneNumber;
                var splitArr = phone.split("-");
                $scope.member.countryCode = splitArr[0];
                $scope.member.phoneNumber = phone.split('-').slice(1).join('-');

                /*if ($scope.member.emergencyContact.contactNumber) {
                    var contactPhone = $scope.member.emergencyContact.contactNumber;
                    var contactSplit = contactPhone.split("-");
                    /!*$scope.member.emergencyContact.countryCode = contactSplit[0];*!/
                    $scope.member.emergencyContact.contactNumber = contactPhone.split('-').slice(1).join('-');
                } else {
                    $scope.member.emergencyContact.contactNumber = "";
                }*/
                if (!$scope.member.picture || $scope.member.picture == '') {
                    $scope.profilePicUrl = 'assets/images/no-avatar.png'
                } else {
                    $scope.profilePicUrl = AWS + 'Member/' + $scope.member.memberId + '/' + $scope.member.picture + '.png';
                }
                $scope.member.documents.forEach(function (document) {
                    //document.documentProof = AWS + 'Member/' + $scope.member.memberId + '/' + document.documentCopy + '.png';
                    document.documentProof = "http://www.mytrintrin.com/mytrintrin/" + 'Member/' + $scope.member._id + '/' + document.documentCopy + '.png';
                });
                if ($scope.member.membershipId) {
                    var membershipName = $scope.member.membershipId.subscriptionType;
                    DataService.getMemberships().then(function (response) {
                        if (!response.error) {
                            $scope.memberships = response.data;
                            $scope.memberships.forEach(function (membership) {
                                if (membership.subscriptionType === membershipName) {
                                    $scope.selectMembershipPlan = membership._id;
                                }
                            });
                        }
                    });
                }
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.removeProfilePic = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                closeOnConfirm: true
            }, function () {
                $scope.member.phoneNumber = $scope.member.countryCode + '-' + $scope.member.phoneNumber;
               /* if ($scope.member.emergencyContact.contactNumber) {
                    $scope.member.emergencyContact.contactNumber =$scope.member.countryCode + '-' + $scope.member.emergencyContact.contactNumber;
                } else {
                    $scope.member.emergencyContact.contactNumber = "";
                }*/
                $scope.member.picture = '';
                DataService.updateMember($scope.member).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
            });
        };

        DataService.getMemberships().then(function (response) {
            if (!response.error) {
                $scope.memberships = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.selectedMembershipPlan = function (data) {
            $scope.member.membershipId = data;
        };

        $scope.updateMember = function () {
            $scope.member.phoneNumber = $scope.member.countryCode + '-' + $scope.member.phoneNumber;
            /*if ($scope.member.emergencyContact.contactNumber) {
                $scope.member.emergencyContact.contactNumber = $scope.member.countryCode + '-' + $scope.member.emergencyContact.contactNumber;
            } else {
                $scope.member.emergencyContact.contactNumber = "";
            }*/
            DataService.updateMember($scope.member).then(function (response) {
                if (!response.error) {
                    if ($scope.member.membershipChanged) {
                        var membershipData = {
                            _id: $scope.member._id,
                            membershipId: $scope.member.membershipId,
                            createdBy:_login_id
                        };
                        DataService.updateMembershipForMember(membershipData).then(function (response) {
                            if (!response.error) {
                                growl.success(response.message);
                                if ($scope.member.cardChanged) {
                                    var smartCardData = {
                                        _id: $scope.member._id,
                                        cardNumber: $scope.member.smartCardNumber,
                                        membershipId: $scope.member.membershipId,
                                        createdBy:_login_id
                                    };
                                    DataService.updateSmartCardForMember(smartCardData).then(function (response) {
                                        if (!response.error) {
                                            growl.success(response.message);
                                            window.location.reload();
                                        } else {
                                            growl.error(response.message);
                                        }
                                    }, function (response) {
                                        growl.error(response.data.description);
                                    });
                                }
                                window.location.reload();
                            } else {
                                growl.error(response.message);
                            }
                        }, function (response) {
                            growl.error(response.data.description);
                        });
                    } else {
                        if ($scope.member.cardChanged) {
                            var smartCardData = {
                                _id: $scope.member._id,
                                cardNumber: $scope.member.smartCardNumber,
                                membershipId: $scope.member.membershipId
                            };
                            DataService.updateSmartCardForMember(smartCardData).then(function (response) {
                                if (!response.error) {
                                    growl.success(response.message);
                                    $state.reload();
                                } else {
                                    growl.error(response.message);
                                }
                            }, function (response) {
                                growl.error(response.data.description);
                            });
                        }
                        window.location.reload();
                    }
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.cancelUpdateMember = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.members.manage');
            });
        };

        $scope.paymentsData = [];

        /*var filtersPayments = {
            filter: {
               /!* where: {'member': $stateParams.id},*!/
                where: {'memberId': $stateParams.id},
                order: {'createdAt': -1}
            }
        };*/

        DataService.getMemberPaymentTransaction1($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.paymentsData = response.data;
                $scope.transactionCount = response.data.length;
                $scope.paymentsTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.paymentsTable = new NgTableParams(
            {
                count: 20
            },
            {
                counts: [],
                getData: function ($defer, params) {
                    params.total($scope.paymentsData.length);
                    $defer.resolve($scope.paymentsData);
                }
            }
        );

        $scope.ridesData = [];

        DataService.getRidesAdmin($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.ridesData = response.data;
                $scope.ridesCount = response.data.length;
                $scope.ridesTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.ridesTable = new NgTableParams(
            {
                count: 20
            },
            {
                counts: [],
                getData: function ($defer, params) {
                    params.total($scope.ridesData.length);
                    $defer.resolve($scope.ridesData);
                }
            }
        );


    }]);

    // Membership Plan for member Controller
    app.controller('MembershipForMember', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'member', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, member) {

        $scope.member = member;
        $scope.member.membershipChanged = false;

        DataService.getMemberships().then(function (response) {
            if (!response.error) {
                $scope.memberships = response.data;
                if ($scope.member.membershipId) {
                    var membershipName = $scope.member.membershipId.subscriptionType;
                    DataService.getMemberships().then(function (response) {
                        if (!response.error) {
                            $scope.memberships = response.data;
                            $scope.memberships.forEach(function (membership) {
                                if (membership.subscriptionType === membershipName) {
                                    $scope.selectMembershipPlan = membership._id;
                                }
                            });
                        }
                    });
                }
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.selectedMembershipPlan = function (data) {
            $scope.memberships.forEach(function (membership) {
                if (membership._id === data._id) {
                    $scope.member.membershipId = membership;
                }
            });
        };

        $scope.changeMembership = function () {
            sweet.show({
                title: 'Assign Membership?',
                text: 'The member will be assigned with that membership',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add membership',
                closeOnConfirm: true
            }, function () {
                var membershipData = {
                    _id: $scope.member._id,
                    membershipId: $scope.member.membershipId._id
                };
                DataService.updateMembershipForMember(membershipData).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.cancelMembershipChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Smart Card for member Controller
    app.controller('SmartCardForMember', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'member', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, member) {

        $scope.member = member;
        $scope.member.cardChanged = false;

        $scope.verify = function () {
            var smartCard = {
                cardNumber: $scope.member.smartCardNumber
            };
            DataService.verifyCardForMember(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.changeSmartCard = function () {
            sweet.show({
                title: 'Assign SmartCard?',
                text: 'The member will be assigned with that smartCard',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add smartCard',
                closeOnConfirm: true
            }, function () {
                var data = {
                    _id: $scope.member._id,
                    cardNumber: $scope.member.smartCardNumber,
                    membershipId: $scope.member.membershipId,
                    createdBy:_login_id
                };
                DataService.updateSmartCardForMember(data).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
            };

        $scope.cancelSmartCardChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Search member details Controller
    var _searched_member_id;
    var _searched_member_name;
    app.controller('SearchMemberDetails', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal','$uibModalInstance', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal,$uibModalInstance)
        {
        $scope.searchMember={
            name:_search_member_name
        };

        $scope.SearchDetails = [];

            DataService.memberSearch($scope.searchMember).then(function (response) {
                if (!response.error) {
                    $scope.SearchDetails = response.data;
                    $scope.SearchMemberDetailsTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.SearchDetails, params.filter()) : $scope.SearchDetails;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        }
                    );
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })

            $scope.cancelSearchMemberDetails = function () {
                $uibModalInstance.dismiss();
            };

            $scope.getDetails=function(event)
            {
                _searched_member_id=event.currentTarget.value;
               /* _searched_member_name = event.currentTarget.name;*/
                _global_search_member_name = event.currentTarget.name;
                $scope.RaiseNewTickets();
                /*$uibModalInstance.dismiss();*/
            }

            $scope.RaiseNewTickets = function (size) {
                $uibModal.open({
                    templateUrl: 'raise-tickets.html',
                    controller: 'RaiseTickets',
                    size: size,
                    resolve: {
                        items: function () {
                        }
                    }
                });
            };
    }]);

    app.controller('RaiseTickets', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal','$uibModalInstance', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal,$uibModalInstance)
    {
        $scope.raiseTicketsDetails = {
            memberName:_global_search_member_name,
            memberId:_searched_member_id,
            ticketSubject:'',
            ticketDescription:'',
            priorityName:'',
            departmentName:'',
            type:''
        };


        $scope.addNewTicketDetails = function () {
            DataService.saveTicketDetails($scope.raiseTicketsDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.departmentNames = [];
        $scope.valueSelections = [];
        $scope.keyValues = [];
        var Values;

        DataService.getGlobalKeyNameValues().then(function (response)
        {
            if (!response.error) {
                $scope.departmentNames = response.data;
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.selectedDepartment =function(data)
        {
            $scope.raiseTicketsDetails.departmentName=data.name;

            for (var i=0;i<data.value.length;i++)
            {
                Values = data.value[i];
                $scope.valueSelections.push(Values);

                $scope.selectedValue=function (Values) {
                    $scope.raiseTicketsDetails.type=Values;
                }
            }
        };

        $scope.cancelRaiseTickets = function () {
            $uibModalInstance.dismiss();
        };


    }]);

    // Member Credit Modal
    app.controller('CreditModalCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser) {

        $scope.member = {
            credit: 0,
            creditMode: '',
            transactionNumber: '',
            comments: '',
            /*createdBy: loggedInUser.assignedUser*/
            createdBy: _login_id
        };

        $scope.cancelCredit = function () {
            $uibModalInstance.dismiss();
        };

        $scope.addCredit = function () {
            DataService.addCredit($stateParams.id, $scope.member).then(function (response) {
                if (!response.error && response.data != null) {
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                    $state.reload();
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
               /* growl.error(response.data.description['0']);*/
                growl.error(response.data.description);
            });
        }

    }]);

    // Member Debit Modal
    app.controller('DebitModalCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser) {

        $scope.member = {
            debit: 0,
            comments: '',
            /*createdBy: loggedInUser.assignedUser*/
            createdBy:_login_id
        };

        $scope.cancelDebit = function () {
            $uibModalInstance.dismiss();
        };

        $scope.addDebit = function () {
            DataService.addDebit($stateParams.id, $scope.member).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        }

    }]);

    // cancel membership
    app.controller('CancelMembershipModalCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance','$uibModal', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance,$uibModal, loggedInUser) {

        DataService.cancelRequest($stateParams.id).then(function (response) {
            if (!response.error && response.data != null) {
                /*alert(response.data.message);*/

                $scope.Message=response.data.message;
               /* $scope.testing_demo=testing_demo;*/

                growl.success(response.data);
               /* $uibModalInstance.dismiss();*/
                $state.reload();
            }
            else
            {
                growl.error(response.message);
            }
        }, function (response) {
            /* growl.error(response.data.description['0']);*/
            growl.error(response.data.description);
        });
      /*  $scope.member = {
            creditMode: '',
            comments: '',
            transactionNumber:''
           /!* createdBy: loggedInUser.assignedUser*!/
        };

        $scope.cancelMemberShip = function () {
            DataService.cancelMember($stateParams.id, $scope.member).then(function (response) {
              if (!response.error && response.data != null) {
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                    $state.reload();
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /!* growl.error(response.data.description['0']);*!/
                growl.error(response.data.description);
            });
        }*/

        $scope.cancelMembershipcancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.ConfirmCancelMembership = function (size) {
            $uibModal.open({
                templateUrl: 'ConfirmCancelMembership.html',
                controller: 'ConfirmMembershipCancel',
                size: size,
                resolve: {
                    items: function () {
                    }
                }
            });
        };

    }]);

    // cancel membership response
    app.controller('ConfirmMembershipCancel', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser) {

        $scope.confirmMembershipInputs={
            modeOfRefund:'',
            transactionNumber:'',
            comments:''
        };

        /*$scope.OkConfirm = function () {
            $uibModalInstance.dismiss();
        };*/
        $scope.ExitRefund = function () {
         $uibModalInstance.dismiss();
         };

        $scope.Refund = function () {

            DataService.cancelMembership($stateParams.id,$scope.confirmMembershipInputs).then(function (response) {
                if (!response.error && response.data != null) {
                    $uibModalInstance.dismiss();
                    growl.success(response.message);
                    $state.reload();
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /* growl.error(response.data.description['0']);*/
                growl.error(response.data.description);
            });
        };
    }]);

    // suspend membership
    app.controller('SuspendMembershipModalCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser) {

        $scope.member = {
            comments: '',
            /* createdBy: loggedInUser.assignedUser*/
        };

        $scope.suspendMemberShip = function () {
            DataService.suspendMember($stateParams.id, $scope.member).then(function (response) {
                if (!response.error && response.data != null) {
                    if(response.data.status === -2)
                    {
                    }
                    else if (response.data.status === 1)
                    {
                    }
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                    $state.reload();
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        }

        $scope.cancelSuspend = function () {
            $uibModalInstance.dismiss();
        };
    }]);

    // Manage Employees Controller
    app.controller('ManageEmployees', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService, AWS) {
        $scope.employeesData = [];

        var filters = {
            filter: {
                populate: {path: 'smartCardDetails.smartCardId'}
            }
        };

        DataService.getEmployees(filters).then(function (response) {
            if (!response.error) {
                $scope.employeesData = response.data;
                $scope.employeesData.forEach(function (employee) {
                    employee.status = StatusService.getEmployeeStatus(employee.status);
                    /*for (var i = 0; i < employee.smartCardDetails.length; i++) {
                        employee.smartCardDetails[i].cardLevel = StatusService.getCardLevel(employee.smartCardDetails[i].smartCardId.cardLevel);
                    }*/
                    if (!employee.picture || employee.picture == '') {
                        employee.profilePicUrl = 'assets/images/no-avatar.png'
                    } else {
                        employee.profilePicUrl = AWS + 'Employee/' + employee.employeeId + '/' + employee.picture + '.png';
                    }
                });
                $scope.employeesTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.employeesTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.employeesData, params.filter()) : $scope.employeesData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.changeEmployeeStatus = function (id) {
            var selectedEmployee = {};
            $scope.employeesData.forEach(function (employee) {
                if (employee._id === id) {
                    selectedEmployee = employee;
                }
            });
            return $uibModal.open({
                templateUrl: 'employee-status-modal.html',
                controller: 'EmployeeStatus',
                size: 'md',
                resolve: {
                    employee: function () {
                        return selectedEmployee;
                    }
                }
            });
        };

        $scope.addNewEmployee = function () {
            $state.go('admin.employees.add');
        };

        $scope.editEmployee = function (id) {
            $state.go('admin.employees.edit', {'id': id});
        };
    }]);

    // Employee Status Controller
    app.controller('EmployeeStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'employee', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, employee) {

        $scope.employee = employee;

        $scope.changeEmployeeStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.employee.status = parseInt($scope.employee.status);
                DataService.updateEmployee($scope.employee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelEmployeeStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Add Employees Controller
    app.controller('AddEmployees', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {
        $scope.employee = {
            /*name: '',*/
            Name:'',
            lastName: '',
           /* givenName: '',*/
            fatherName: '',
            education: '',
            occupation: '',
            sex: '',
            phoneNumber: '',
            address: '',
            city: 'Mysore',
            state: 'Karnataka',
            country: 'India',
            countryCode: '91',
            pinCode: '',
            emergencyContact: {countryCode: '91'},
            documents: [],
            smartCardDetails: [],
            position: '',
            department: '',
            experiance: '',
            joiningDate: '',
            additionalInfo: ''
        };

        $scope.addNewDocument = function () {
            $scope.employee.documents.push({});
        };

        $scope.removeDocument = function ($index) {
            $scope.employee.documents.splice($index, 1);
        };

        $scope.addEmployees = function () {
            $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
            if ($scope.employee.emergencyContact.contactNumber) {
                $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
            } else {
                $scope.employee.emergencyContact.contactNumber = "";
            }
            DataService.saveEmployee($scope.employee).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.employees.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
               /* growl.error(response.data.description['0']);*/
            })
        };

        $scope.cancelAddEmployee = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.employees.manage');
            });
        };
    }]);

    // Edit Member Controller
    app.controller('EditEmployee', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$filter', 'AWS', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $filter, AWS, $uibModal) {
        $scope.employee = {};

        $scope.addNewDocument = function () {
            $scope.employee.documents.push({});
        };

        $scope.addNewSmartCard = function () {
            $scope.employee.smartCardDetails.push({});
        };

        $scope.removeSmartCard = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                closeOnConfirm: true
            }, function () {
                var removeSmartCard = $scope.employee.smartCardDetails[$index].smartCardId;
                DataService.deactivateCard(removeSmartCard).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.verify = function ($index) {
            var smartCard = {
                cardNumber: [$scope.employee.smartCardDetails[$index].smartCardNumber]
            };
            DataService.verifyCardForEmployee(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.removeDocument = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            }, function () {
                $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
                if ($scope.employee.emergencyContact.contactNumber) {
                    $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }
                $scope.employee.documents.splice($index, 1);
                DataService.updateEmployee($scope.employee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.addSmartCard = function () {
            return $uibModal.open({
                templateUrl: 'smartCard-status-modal.html',
                controller: 'SmartCardForEmployee',
                size: 'md',
                resolve: {
                    employee: function () {
                        return $scope.employee;
                    }
                }
            });
        };

        $scope.changeEmployeeStatus = function () {
            return $uibModal.open({
                templateUrl: 'employee-status-modal.html',
                controller: 'EmployeeStatus',
                size: 'md',
                resolve: {
                    employee: function () {
                        return $scope.employee;
                    }
                }
            });
        };

        $scope.verifyDocument = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'This will activate the employee\'s account',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                closeOnConfirm: true
            }, function () {
                $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
                if ($scope.employee.emergencyContact.contactNumber) {
                    $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }
                $scope.employee.status = 1;
                DataService.verifyDocumentEmployee($scope.employee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        DataService.getEmployee($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.employee = response.data[0];
                var name = response.data[0].Name;
                var phone = $scope.employee.phoneNumber;
                var splitArr = phone.split("-");
                $scope.employee.countryCode = splitArr[0];
                $scope.employee.phoneNumber = phone.split('-').slice(1).join('-');

               /* if ($scope.employee.emergencyContact.contactNumber) {
                    var contactPhone = $scope.employee.emergencyContact.contactNumber;
                    var contactSplit = contactPhone.split("-");
                    $scope.employee.emergencyContact.countryCode = contactSplit[0];
                    $scope.employee.emergencyContact.contactNumber = contactPhone.split('-').slice(1).join('-');
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }*/
                if (!$scope.employee.picture || $scope.employee.picture == '') {
                    $scope.profilePicUrl = 'assets/images/no-avatar.png'
                } else {
                    $scope.profilePicUrl = AWS + 'Employee/' + response.data.employeeId + '/' + response.data.picture + '.png';
                }
                $scope.employee.documents.forEach(function (document) {
                    document.documentProof = AWS + 'Employee/' + $scope.employee.employeeId + '/' + document.documentCopy + '.png';
                });
                $scope.employee.joiningDate = new Date($scope.employee.joiningDate);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.removeProfilePic = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                closeOnConfirm: true
            }, function () {
                $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
                if ($scope.employee.emergencyContact.contactNumber) {
                    $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }
                $scope.employee.picture = '';
                DataService.updateEmployee($scope.employee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.updateEmployee = function () {
            $scope.employee.phoneNumber =$scope.employee.phoneNumber;
            if ($scope.employee.emergencyContact.contactNumber) {
                $scope.employee.emergencyContact.contactNumber =  $scope.employee.emergencyContact.contactNumber;
            } else {
                $scope.employee.emergencyContact.contactNumber = "";
            }
            DataService.updateEmployee($scope.employee).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                   // window.location.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

        $scope.cancelUpdateEmployee = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.employees.manage');
            });
        };

    }]);

    // Smart Card  Controller
    app.controller('SmartCardForEmployee', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'employee', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, employee) {

       /* $scope.employee = employee;

        $scope.addNewSmartCard = function () {
            $scope.employee.smartCardDetails.push({});
        };

        $scope.verify = function ($index) {
            var smartCard = {
                cardNumber: [$scope.employee.smartCardDetails[$index].smartCardNumber]
            };
            DataService.verifyCardForEmployee(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.AddSmartCard = function () {
            sweet.show({
                title: 'Assign Smart Card?',
                text: 'The employee will be assigned with that smartcard',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                var cardNumber = [];
                for (var i = 0; i < $scope.employee.smartCardDetails.length; i++) {
                    if (!$scope.employee.smartCardDetails[i]._id) {
                        cardNumber.push($scope.employee.smartCardDetails[i].smartCardNumber)
                    }
                }
                var smartCardForEmployee = {
                    _id: $scope.employee._id,
                    cardNumber: cardNumber
                };
                DataService.updateSmartCardForEmployee(smartCardForEmployee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.cancelSmartCard = function () {
            $uibModalInstance.dismiss();
            $state.reload();
        };*/


        $scope.employee = employee;
        $scope.employee.cardChanged = false;

        $scope.Empcard={
            _id: $scope.employee._id,
            cardNumber: ''
        };


        $scope.verify = function () {
            var smartCard = {
                cardNumber: $scope.employee.smartCardNumber
            };
            DataService.verifyCardForMember(smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message)
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.AddSmartCard = function () {
            sweet.show({
                title: 'Assign SmartCard?',
                text: 'The member will be assigned with that smartCard',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Add smartCard',
                closeOnConfirm: true
            }, function () {
                /*var data = {
                    _id: $scope.member._id,
                    cardNumber: $scope.member.smartCardNumber,
                    membershipId: $scope.member.membershipId
                };*/

/*
                 $scope.Empcard={
                    _id: $scope.employee._id,
                     cardNumber: ''
                };*/
                DataService.updateSmartCardForEmployee($scope.Empcard).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.cancelSmartCard = function () {
            $uibModalInstance.dismiss();
            $state.reload();
        };
    }]);

    //Manage Membership
    app.controller('ManageMembership', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'NgTableParams', '$filter', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, NgTableParams, $filter, $uibModal, StatusService) {
        $scope.membershipData = [];

        var filters = {
            filter: {
                populate: {path: 'farePlan'}
            }
        };

        DataService.getMemberships(filters).then(function (response) {
            if (!response.error) {
                $scope.membershipData = response.data;
                $scope.membershipData.forEach(function (membership) {
                    membership.status = StatusService.getMembershipStatus(membership.status);
                    membership.planName = membership.farePlan.planName;
                    membership.total = membership.userFees + membership.securityDeposit + membership.smartCardFees +
                        membership.processingFees;
                });
                $scope.membershipTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.membershipTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.membershipData, params.filter()) : $scope.membershipData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.editMembership = function (id) {
            $state.go('admin.membership.edit', {'id': id});
        };

        $scope.addNewMembership = function () {
            $state.go('admin.membership.add');
        };

    }]);

    //Add Membership
    app.controller('AddMembership', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', function ($scope, $state, $stateParams, DataService, growl, sweet) {
        $scope.membership = {
            subscriptionType: '',
            validity: '',
            userFees: '',
            securityDeposit: '',
            smartCardFees: '',
            processingFees: ''
        };

        $scope.farePlans = [];

        DataService.getFarePlans().then(function (response) {
            if (!response.error) {
                $scope.farePlans = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.selectedFarePlan = function (data) {
            $scope.membership.farePlan = data.id;
        };

        $scope.addMembership = function () {
            DataService.saveMembership($scope.membership).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.membership.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddMembership = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.membership.manage');
            });
        };

    }]);

    //Edit Membership
    app.controller('EditMembership', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModal) {
        $scope.membership = {};

        var filters = {
            filter: {
                populate: {path: 'farePlan'}
            }
        };

        DataService.getMembership($stateParams.id, filters).then(function (response) {
            if (!response.error) {
                $scope.membership = response.data;
                $scope.profilePicUrl = AWS + 'Membership/' + response.data.membershipId + '/' + response.data.picture + '.png';
                var farePlanName = $scope.membership.farePlan.planName;
                DataService.getFarePlans().then(function (response) {
                    if (!response.error) {
                        $scope.farePlans = response.data;
                        $scope.farePlans.forEach(function (farePlan) {
                            $scope.membership.selectPlan = farePlan.planName;
                            if (farePlan.planName === farePlanName) {
                                $scope.selectPlan = farePlan._id;
                            }
                        });
                    }
                });
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.selectedFarePlan = function (id) {
            $scope.farePlans.forEach(function (farePlan) {
                if (farePlan._id === id) {
                    $scope.membership.farePlan = farePlan;
                }
            });
        };

        $scope.updateMembership = function () {
            DataService.updateMembership($scope.membership).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);

                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelUpdateMembership = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.membership.manage');
            });
        };

    }]);


    app.controller('DockingStations', ['$scope','$interval', 'DataService', 'growl', 'StatusService', 'NgTableParams', '$filter', 'sweet', 'loggedInUser', '$state', 'GOOGLEMAPURL', function ($scope,$interval, DataService, growl, StatusService, NgTableParams, $filter, sweet, loggedInUser, $state, GOOGLEMAPURL)
    {
        var multiDockingStations = [];

        $scope.dockingStationsData = [];
            DataService.getDockingStations().then(function (response) {

                if (!response.error) {
                    $scope.dockingStationsData = response.data;
                    $scope.dockingStations = response.data;
                    for (var i = 0; i < $scope.dockingStations.length; i++) {
                        var longAndLat = {
                            longitude: $scope.dockingStations[i].gpsCoordinates.longitude,
                            latitude: $scope.dockingStations[i].gpsCoordinates.latitude,
                            mapUrl: GOOGLEMAPURL,
                            show: false,
                            title: $scope.dockingStations[i].name,
                            bicycleCount: $scope.dockingStations[i].bicycleCount,
                            bicycleCapacity: $scope.dockingStations[i].bicycleCapacity,
                            dockingStationStatus: StatusService.getDockingStationStatus($scope.dockingStations[i].status),
                            id: i
                        };
                        multiDockingStations.push(longAndLat);
                    }

                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });


            $scope.map = {
                center: {
                    latitude: 12.3024314,
                    longitude: 76.6615633
                }, zoom: 13
            };

            $scope.options = {scrollwheel: false};
            $scope.markers = multiDockingStations;

            $scope.windowOptions = {
                visible: false
            };

            $scope.onClick = function (marker, eventName, model) {
                model.show = !model.show;
            };

            $scope.closeClick = function () {
                $scope.windowOptions.visible = false;
            };

            $scope.swapView = function (viewType) {
                $scope.view = viewType;
            };

        $scope.loadBicycleAvaliability = function () {
            $state.reload();
        };
    }]);

    app.controller('SelectPlans', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'NgTableParams', '$filter', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, NgTableParams, $filter, $uibModal, StatusService) {
        $scope.membershipData = [];

        var filters = {
            filter: {
                populate: {path: 'farePlan'}
            }
        };

        DataService.getMemberships(filters).then(function (response) {
            if (!response.error) {
                $scope.membershipData = response.data;
              /*  $scope.membershipData.forEach(function (membership) {
                    membership.status = StatusService.getMembershipStatus(membership.status);
                    membership.planName = membership.farePlan.planName;
                    membership.total = membership.userFees + membership.securityDeposit + membership.smartCardFees +
                        membership.processingFees;
                });*/
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.membershipTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.membershipData, params.filter()) : $scope.membershipData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

            $scope.Selectplan = function (size) {
                $uibModal.open({
                    templateUrl: 'Error-popup.html',
                    controller: 'ErrorPopUp',
                    size: size,
                    resolve: {
                        items: function () {
                        }
                    }
                });
            };
    }]);

    // Select plan error pop up message (temporary)
    app.controller('ErrorPopUp', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser)
    {
        $scope.ok = function () {
            $uibModalInstance.dismiss();
        };
    }]);

    // ride history
/*    app.controller('RideHistory', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModal','$filter', 'NgTableParams', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModal, $filter, NgTableParams)
    {
        alert(_login_id);

        $scope.ridesDataUser = [];
        DataService.getRidesUser(_login_id).then(function (response) {
            if (!response.error) {
                for (var i=0;i<response.data.length;i++) {
                    $scope.ridesDataUser = response.data[i];
                }
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.ridesTableUser = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.ridesDataUser, params.filter()) : $scope.ridesDataUser;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

    }]);*/

    app.controller('RideHistory', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {

      /*  $scope.user_id = _user_id;*/
        $scope.user_id = _login_id;

        $scope.ridesDataUser = [];

        DataService.getRidesUser($scope.user_id).then(function (response) {
            if (!response.error) {
                var i=0;
               /* $scope.ridesDataUser= response.data;*/
                for(i=0;i<response.data.length;i++)
                {
                var _rides = response.data[i];
                $scope.ridesDataUser.push(_rides);
                }

            }
            else
                {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.ridesTableUser = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.ridesDataUser, params.filter()) : $scope.ridesDataUser;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );
    }]);

    // Payment Histroy
    app.controller('PaymentHistory', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {
        $scope.user_id = _user_id;

        $scope.userPaymentHistory = [];

        DataService.getUserPayment($scope.user_id).then(function (response) {
            if (!response.error) {
                var i=0;
                /* $scope.ridesDataUser= response.data;*/
                for(i=0;i<response.data.length;i++)
                {
                    var _payments = response.data[i];
                    $scope.userPaymentHistory.push(_payments);
                }
                var k=0;
            }
            else
            {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.userPaymentTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.userPaymentHistory, params.filter()) : $scope.userPaymentHistory;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

    }]);

    // Change password
    app.controller('ChangePassword', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {
        $scope.user = {
            oldpassword:'',
            password: '',
            confirmPassword: ''
        };

        $scope.passwordChange=function(){
        DataService.changePassword($scope.user).then(function (response) {
            if (!response.error)
            {
                growl.success(response.message);
            }
            else
            {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });
        };
    }]);

    // Docking Station Status Controller
    app.controller('DockingStationStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'dockingStation', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, dockingStation) {

        $scope.dockingStation = dockingStation;

        $scope.changeStationStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.dockingStation.status = parseInt($scope.dockingStation.status);
                DataService.updateDockingStation($scope.dockingStation).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelDockingStationStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('AddDockingStation', ['$scope', '$state', 'sweet', 'DataService', 'growl', '$uibModal', function ($scope, $state, sweet, DataService, growl, $uibModal) {

        $scope.dockingStation = {
            stationNumber: '',
            noofUnits:'',
            noofPorts:'',
            modelType: '',
            gpsCoordinates: {
                longitude: '',
                latitude: ''
            },
            maxAlert: '',
            minAlert: '',
            name: '',
            dockingUnitIds: [],
            ipAddress: '',

            template:'',
            commissioneddate:'',
            subnet:0,
            zoneId:''

        };

        $scope.cancelAddDockingStation = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-stations.manage');
            });
        };

        var dockingStation = $scope.dockingStation;
        $scope.saveDockingStation = function () {
            return $uibModal.open({
                templateUrl: 'docking-station-sync.html',
                controller: 'DockingStationSync',
                size: 'sm',
                resolve: {
                    dockingStation: function () {
                        return dockingStation;
                    }
                }
            });
        };

    }]);

    // Docking Unit Status Controller
    app.controller('DockingStationSync', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'dockingStation', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, dockingStation) {

        $scope.dockingStation = dockingStation;

        $scope.cancelSync = function () {
            DataService.saveDockingStationWithOutSync($scope.dockingStation).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                    $state.reload();
                    $state.go('admin.docking-stations.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
        };

        $scope.syncNow = function () {
            DataService.saveDockingStation($scope.dockingStation).then(function (response) {
                if (!response.error) {
                    var ipAddress = {
                        ipAddress: $scope.dockingStation.ipAddress
                    };
                    console.log(ipAddress);
                    DataService.saveDockingStationWithSync(ipAddress).then(function (response) {
                        if (!response.error) {
                            growl.success(response.message);
                            $uibModalInstance.dismiss();
                            $state.reload();
                            $state.go('admin.docking-stations.edit', {'id': response.data._id});
                        } else {
                            growl.error(response.message);
                        }
                    }, function (response) {
                        growl.error(response.data.description['0']);
                    });
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
        };

    }]);

    app.controller('EditDockingStation', ['$scope', '$state', '$uibModal', '$stateParams', 'DataService', 'StatusService', 'growl','GOOGLEMAPURL', 'sweet', function ($scope, $state, $uibModal, $stateParams, DataService, StatusService, growl, GOOGLEMAPURL,sweet) {

        $scope.dockingStation = {};

        $scope.dockingStationMap = {
            center: {
                latitude:0 ,
                longitude:0
            },
            zoom: 15
        };

        DataService.getDockingStation($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.dockingStation = response.data;
                $scope.dockingStationStatus = StatusService.getDockingStationStatus($scope.dockingStation.status);
                $scope.dockingStationMap.center.latitude = parseFloat($scope.dockingStation.gpsCoordinates.latitude);
                $scope.dockingStationMap.center.longitude = parseFloat($scope.dockingStation.gpsCoordinates.longitude);
                var myLatLng = {lat: $scope.dockingStationMap.center.latitude , lng: $scope.dockingStationMap.center.longitude };
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: 'Hello World!'
                });
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

      /* $scope.updateDockingStation = function () {
            if (parseInt($scope.dockingStation.noOfDockingUnits) < $scope.dockingStation.dockingUnitIds.length)
            {
                growl.error("Total Units for this Station cannot be lesser than current occupancy, which is " + $scope.dockingStation.dockingUnitIds.length);
            }
            else
            {
                DataService.updateDockingStation($scope.dockingStation).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
          }
        };*/

        $scope.updateDockingStation = function () {
                DataService.updateDockingStation($scope.dockingStation).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
        };




        $scope.changeDockingStationStatus = function () {
            return $uibModal.open({
                templateUrl: 'docking-station-status-modal.html',
                controller: 'DockingStationStatus',
                size: 'md',
                resolve: {
                    dockingStation: function () {
                        return $scope.dockingStation;
                    }
                }
            });
        };



        $scope.testConnection = function (data) {
            var ipAddress = {
                ipAddress: data
            };
            console.log(ipAddress);
            DataService.testConnectionForIP(ipAddress).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.syncNow = function (data) {
            sweet.show({
                title: 'Are you sure?',
                text: 'Sync data to the Docking Station',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Sync',
                closeOnConfirm: true
            }, function () {
                var ipAddress = {
                    ipAddress: data
                };
                console.log(ipAddress);
                DataService.saveDockingStationWithSync(ipAddress).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            })
        };

        $scope.cancelUpdateDockingStation = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-stations.manage');
            });
        };
    }]);

    // Docking station ( view more details )
    app.controller('DockingStationMoreDetails', ['$scope', '$state', '$uibModal', '$stateParams', 'DataService', 'StatusService', 'growl','GOOGLEMAPURL', 'sweet', function ($scope, $state, $uibModal, $stateParams, DataService, StatusService, growl, GOOGLEMAPURL,sweet) {

        $scope.dockingStation = {};

        $scope.Zone= "";

        DataService.getDockingStation($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.dockingStation = response.data;
            if( $scope.dockingStation.zoneId==3)
                {
                $scope.Zone ="Zone 3";
                }
                $scope.dockingStationStatus = StatusService.getDockingStationStatus($scope.dockingStation.status);
                $scope.dockingStationMap.center.latitude = parseFloat($scope.dockingStation.gpsCoordinates.latitude);
                $scope.dockingStationMap.center.longitude = parseFloat($scope.dockingStation.gpsCoordinates.longitude);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.cancelDockingStationMoreDetails = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-stations.manage');
            });
        };

    }]);


    app.controller('ManageDockingUnit', ['$scope', 'NgTableParams', '$state', 'DataService', 'growl', 'sweet', 'constantService', '$filter', 'StatusService', '$uibModal', function ($scope, NgTableParams, $state, DataService, growl, sweet, constantService, $filter, StatusService, $uibModal) {

        /*Docking Units Statuses*/
        $scope.DockUnitStatus = constantService.DockUnitStatus;

        $scope.dockingUnits = [];

        $scope.dockingUnitsTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.dockingUnits, params.filter()) : $scope.dockingUnits;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        var filters = {
            filter: {
                populate: [{path: 'dockingStationId'}]
            }
        };

        DataService.getDockingUnits(filters).then(function (response) {
            if (!response.error) {
                $scope.dockingUnits = response.data;
                $scope.dockingUnits.forEach(function (dockingUnit) {
                    dockingUnit.status = StatusService.getDockingUnitsStatus(dockingUnit.status);
                    dockingUnit.name = dockingUnit.dockingStationId.name;
                });
                $scope.dockingUnitsTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.changeDockingUnitStatus = function (id) {
            var selectedDockingUnit = {};
            $scope.dockingUnits.forEach(function (dockingUnit) {
                if (dockingUnit._id === id) {
                    selectedDockingUnit = dockingUnit;
                }
            });
            return $uibModal.open({
                templateUrl: 'docking-unit-status-modal.html',
                controller: 'DockingUnitStatus',
                size: 'md',
                resolve: {
                    dockingUnit: function () {
                        return selectedDockingUnit;
                    }
                }
            });
        };

        $scope.addDockingUnit = function () {
            $state.go('admin.docking-units.add')
        };

        $scope.editDockingUnit = function (id) {
            $state.go('admin.docking-units.edit', {'id': id});
        };

    }]);

    // Docking Unit Status Controller
    app.controller('DockingUnitStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'dockingUnit', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, dockingUnit) {

        $scope.dockingUnit = dockingUnit;

        $scope.changeUnitStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.dockingUnit.status = parseInt($scope.dockingUnit.status);
                DataService.updateDockingUnit($scope.dockingUnit).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelDockingUnitStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('AddDockingUnit', ['$scope', 'NgTableParams', '$state', 'DataService', 'growl', 'sweet', function ($scope, NgTableParams, $state, DataService, growl, sweet) {

        $scope.dockingUnit = {
            unitNumber: 0,
            modelType: '',
            unitPosition: '',
            dockingStationId: ''
        };

        $scope.dockingStations = [];

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStations = response.data;
            }
        });


        $scope.selectStationName = function (data) {
            $scope.dockingUnit.dockingStationId = data._id;
        };

        $scope.saveDockingUnit = function () {
            DataService.saveDockingUnit($scope.dockingUnit).then(function (data) {
                if (!data.error) {
                    growl.success(data.message);
                    $scope.savedDockingUnitRecords = data.data;
                    $state.reload();
                    $state.go('admin.docking-units.edit', {'id': data.data._id})
                } else {
                    growl.error(data.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.cancelAddDockingUnit = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-units.manage');
            });
        }

    }]);

    app.controller('EditDockingUnit', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$stateParams', '$uibModal', 'StatusService', function ($scope, $state, DataService, growl, sweet, $stateParams, $uibModal, StatusService) {

        $scope.dockingUnit = {};
        $scope.dockingStations = [];
        var filters = {
            filter: {
                populate: {path: 'dockingStationId'}
            }
        };

        DataService.getDockingUnit($stateParams.id, filters).then(function (response) {
            if (!response.error) {
                var dockingStationName = response.data.dockingStationId.name;
                $scope.dockingUnit = response.data;
                DataService.getDockingStations().then(function (response) {
                    if (!response.error) {
                        $scope.dockingStations = response.data;
                        $scope.dockingStations.forEach(function (dockingStation) {
                            if (dockingStation.name === dockingStationName) {
                                $scope.selectedStationName = dockingStation._id;
                            }
                        });
                    }
                });
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.changeDockingUnitStatus = function () {
            return $uibModal.open({
                templateUrl: 'docking-unit-status-modal.html',
                controller: 'DockingUnitStatus',
                size: 'md',
                resolve: {
                    dockingUnit: function () {
                        return $scope.dockingUnit;
                    }
                }
            });
        };

        $scope.selectStationName = function (id) {
            $scope.dockingStations.forEach(function (dockingStation) {
                if (dockingStation._id === id) {
                    $scope.dockingUnit.dockingStationId = dockingStation;
                }
            });
        };

        $scope.updateDockingUnit = function () {
            if ($scope.dockingUnit.dockingPortIds.length > $scope.dockingUnit.noOfPorts) {
                growl.error("Total ports for this unit cannot be lesser than current occupancy, which is " + $scope.dockingUnit.dockingPortIds.length)
            } else {
                DataService.updateDockingUnit($scope.dockingUnit).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                })
            }
        };

        $scope.cancelUpdateDockingUnit = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-units.manage');
            });

        };

    }]);

    app.controller('ManageDockingPort', ['$scope', 'NgTableParams', '$state', 'DataService', 'growl', 'sweet', 'constantService', '$filter', '$uibModal', 'StatusService', function ($scope, NgTableParams, $state, DataService, growl, sweet, constantService, $filter, $uibModal, StatusService) {

        /*Docking Units Statuses*/
        $scope.DockPortStatus = constantService.DockPortStatus;

        $scope.dockingPorts = [];

        var filters = {
            filter: {
                populate: [{path: 'dockingUnitId dockingStationId'}]
            }
        };

        DataService.getDockingPorts(filters).then(function (response) {
            if (!response.error) {
                $scope.dockingPorts = response.data;
                $scope.dockingPorts.forEach(function (dockingPort) {
                    dockingPort.portStatus = StatusService.getDockingPortStatus(dockingPort.portStatus);
                    //dockingPort.unitNumber = dockingPort.dockingUnitId.unitNumber;
                   // dockingPort.name = dockingPort.dockingStationId.name;
                });
                $scope.dockingPortsTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.cycle = function (data) {
            var BicycleFilters = {
                filter: {
                    where: {cycleRFID: data}
                }
            };

            DataService.getBicycleRFID(BicycleFilters).then(function (response) {
                if (!response.error) {
                    $state.go('admin.bicycles.edit', {'id': response.data[0]._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.dockingPortsTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.dockingPorts, params.filter()) : $scope.dockingPorts;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.changeDockingPortStatus = function (id) {
            var selectedDockingPort = {};
            $scope.dockingPorts.forEach(function (dockingPort) {
                if (dockingPort._id === id) {
                    selectedDockingPort = dockingPort;
                }
            });
            return $uibModal.open({
                templateUrl: 'docking-port-status-modal.html',
                controller: 'DockingPortStatus',
                size: 'md',
                resolve: {
                    dockingPort: function () {
                        return selectedDockingPort;
                    }
                }
            });
        };

        $scope.addDockingPort = function () {
            $state.go('admin.docking-ports.add')
        };

        $scope.editDockingPort = function (id) {
            $state.go('admin.docking-ports.edit', {'id': id});
        };


    }]);

    // Docking Port Status Controller
    app.controller('DockingPortStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'dockingPort', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, dockingPort) {

        $scope.dockingPort = dockingPort;

        $scope.changePortStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
               /* $scope.dockingPort.status = parseInt($scope.dockingPort.status);*/
                $scope.dockingPort.portStatus = parseInt($scope.dockingPort.portStatus);
                DataService.updateDockingPort($scope.dockingPort).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelDockingPortStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('AddDockingPort', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.dockingPort = {
            portNumber: 0,
            modelType: '',
            portPosition: '',
            dockingUnitId: '',
            dockingStationId: '',
            purchaseDetails: {}
        };

        /* Get All Docking Stations */

        $scope.dockingStations = [];
        $scope.dockingUnitIds = [];
        $scope.dockingUnits = [];

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStations = response.data;
            }
            else {
                growl.error(response.message);
            }
        });

        $scope.selectStationName = function (data) {

            $scope.dockingUnitIds = [];

            for (var i = 0; i < data.dockingUnitIds.length; i++) {
                $scope.dockingUnitIds.push(data.dockingUnitIds[i].dockingUnitId);
            }
            $scope.dockingPort.dockingStationId = data._id;

            var filters = {
                filter: {where: {_id: {$in: $scope.dockingUnitIds}}}
            };


            DataService.getDockingUnits(filters).then(function (response) {
                if (!response.error) {
                    $scope.dockingUnits = response.data;
                }
            });

        };

        $scope.selectedUnitNumber = function (dockingId) {
            $scope.dockingPort.dockingUnitId = dockingId._id;
            $scope.selectedDockingUnitNumber = dockingId.unitNumber;

        };

        $scope.saveDockingPort = function () {
            DataService.saveDockingPort($scope.dockingPort).then(function (data) {
                if (!data.error) {
                    growl.success(data.message);
                    $state.reload();
                    $state.go('admin.docking-ports.edit', {'id': data.data._id})
                } else {
                    growl.error(data.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.cancelAddDockingPort = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-ports.manage');
            });

        }

    }]);

    app.controller('EditDockingPort', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$stateParams', '$uibModal', function ($scope, $state, DataService, growl, sweet, $stateParams, $uibModal) {

      /*  $scope.dockingPort = {};*/
        $scope.dockingStations = [];
        $scope.dockingUnitIds = [];
        $scope.dockingUnits = [];

        var filters = {
            filter: {
                populate: {path: 'dockingUnitId dockingStationId'}
            }
        };

        $scope.dockingPort = {};

        DataService.getDockingPort($stateParams.id, filters).then(function (response) {
            if (!response.error) {
                $scope.dockingPort = response.data[0];
                var dockingStationName = $scope.dockingPort.StationId.name;
                /*DataService.getDockingStations().then(function (response)
                {
                    if (!response.error) {
                        $scope.dockingStations = response.data;
                        $scope.dockingStations.forEach(function (dockingStation) {
                            if (dockingStation.name === dockingStationName) {
                                $scope.selectedStationName = dockingStation._id;
                            }
                        });
                        $scope.selectStationName($scope.selectedStationName);
                    }
                });*/

               /* if ($scope.dockingPort.purchaseDetails) {
                    $scope.dockingPort.purchaseDetails.manufacturingDate = new Date($scope.dockingPort.purchaseDetails.manufacturingDate);
                    $scope.dockingPort.purchaseDetails.invoiceDate = new Date($scope.dockingPort.purchaseDetails.invoiceDate);
                    $scope.dockingPort.purchaseDetails.receivedAt = new Date($scope.dockingPort.purchaseDetails.receivedAt);
                }
*/
            }
            else
                {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

       /* $scope.selectStationName = function (id) {
            $scope.dockingUnitIds = [];

            $scope.dockingStations.forEach(function (dockingStation) {
                if (dockingStation._id == id) {
                    $scope.dockingPort.dockingStationId = dockingStation;

                    for (var i = 0; i < dockingStation.dockingUnitIds.length; i++) {
                        $scope.dockingUnitIds.push(dockingStation.dockingUnitIds[i].dockingUnitId);
                    }

                    var filter = {
                        filter: {where: {_id: {$in: $scope.dockingUnitIds}}}
                    };

                    DataService.getDockingUnits(filter).then(function (response) {
                        if (!response.error) {
                            $scope.dockingUnits = response.data;
                            $scope.dockingUnits.forEach(function (dockingUnit) {
                                if (dockingUnit.unitNumber === $scope.dockingPort.dockingUnitId.unitNumber) {
                                    $scope.dockingPort.dockingUnitId = dockingUnit;
                                    $scope.selectedDockingUnitNumber = dockingUnit._id;
                                }
                            })
                        }
                    });

                }
            });
        };*/

        /*$scope.selectUnitNumber = function (id) {
            $scope.dockingUnits.forEach(function (dockingUnit) {
                if (dockingUnit._id === id) {
                    $scope.dockingPort.dockingUnitId = dockingUnit;
                }
            });
        };
*/
        $scope.updateDockingPort = function () {
            DataService.updateDockingPort($scope.dockingPort).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelUpdateDockingPort = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.docking-ports.manage');
            });
        };

        $scope.changeDockingPortStatus = function () {
            return $uibModal.open({
                templateUrl: 'docking-port-status-modal.html',
                controller: 'DockingPortStatus',
                size: 'md',
                resolve: {
                    dockingPort: function () {
                        return $scope.dockingPort;
                    }
                }
            });
        };

    }]);

    // Manage Bicycles Controller
    app.controller('ManageBicycles', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal) {
        $scope.bicyclesData = [];

        DataService.getBicycles().then(function (response) {
            if (!response.error) {
                $scope.bicyclesData = response.data;
                $scope.bicyclesData.forEach(function (bicycle) {
                    bicycle.status = StatusService.getBicycleStatus(bicycle.vehicleStatus);
                    bicycle.location = StatusService.getBicycleLocation(bicycle.location);
                    if (!bicycle.picture || bicycle.picture == '') {
                        bicycle.profilePicUrl = 'assets/images/bicycle.jpg'
                    } else {
                        bicycle.profilePicUrl = AWS + 'Bicycle/' + response.data.picture + '.png';
                    }
                    if (bicycle.dockingStationId) {
                        bicycle.stationName = bicycle.dockingStationId.name;
                    }
                });
                $scope.bicyclesTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.bicyclesTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.bicyclesData, params.filter()) : $scope.bicyclesData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.moveBicycle = function (id) {
            var selectedBicycle = {};
            $scope.bicyclesData.forEach(function (bicycle) {
                if (bicycle._id === id) {
                    selectedBicycle = bicycle;
                }
            });
            return $uibModal.open({
                templateUrl: 'move-bicycle.html',
                controller: 'MoveBicycle',
                size: 'md',
                resolve: {
                    bicycle: function () {
                        return selectedBicycle;
                    }
                }
            });
        };

        $scope.editBicycle = function (id) {
            $state.go('admin.bicycles.edit', {'id': id});
        };

        $scope.addNewBicycle = function () {
            $state.go('admin.bicycles.add');
        };

    }]);

    // Move Bicycle Controller
    app.controller('MoveBicycle', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'bicycle', 'loggedInUser', 'StatusService', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, bicycle, loggedInUser, StatusService) {

        $scope.bicycle = bicycle;
        $scope.bicyclePlace = 0;
        var whereId;
        var currentLocationName;
        $scope.sendTo = [];
        var location;
        var sendingToServer;
        var unitNumberForServer;
        var portNumberForServer;
        var forNumber;

        $scope.placeSelected = function () {
            location = angular.copy(parseInt($scope.bicyclePlace));
            if (location == 4) {
                $scope.dockingStationShow = false;
                DataService.getMaintenanceCentres().then(function (response) {
                    if (!response.error) {
                        $scope.sendTo = response.data;
                        forNumber = 4;
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            }
            if (location == 2) {
                $scope.dockingStationShow = false;
                DataService.getRedistributionVehicles().then(function (response) {
                    if (!response.error) {
                        $scope.sendTo = response.data;
                        forNumber = 2;
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            }
            if (location == 3) {
                $scope.dockingStationShow = false;
                DataService.getHoldingAreas().then(function (response) {
                    if (!response.error) {
                        $scope.sendTo = response.data;
                        forNumber = 3;
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            }
            if (location == 0) {
                $scope.dockingStationShow = true;
                DataService.getDockingStations().then(function (response) {
                    if (!response.error) {
                        $scope.sendTo = response.data;
                        forNumber = 0;
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            }
        };

        $scope.selectedSendTo = function (data, name) {
            whereId = data.id;
            currentLocationName = name;

            var filters = {
                filter: {
                    where: {'dockingStationId': data.id}
                }
            };
            DataService.getDockingUnits(filters).then(function (response) {
                if (!response.error) {
                    $scope.units = response.data;
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.selectedUnit = function (data) {
            unitNumberForServer = data.id;
            var filters = {
                filter: {
                    where: {'dockingUnitId': data.id, 'status': 1}
                }
            };
            DataService.getDockingPorts(filters).then(function (response) {
                if (!response.error) {
                    $scope.ports = response.data;
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.selectedPort = function (data) {
            portNumberForServer = data.id;
        };

        var fromLocation = StatusService.getBicycleLocationNumber($scope.bicycle.location);

        $scope.moveBicycle = function () {
            sweet.show({
                title: 'Move bicycle?',
                text: 'Are you sure',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, move!',
                closeOnConfirm: true
            }, function () {
                /*if (forNumber == 0)
                {*/
                    sendingToServer = {
                        vehicleId: bicycle.id,
                        toPort: fromLocation,
                        currentLocationName: currentLocationName,
                        to: whereId,
                        toName: currentLocationName,
                        fromName: $scope.bicycle.currentLocationName,
                        from: $scope.bicycle.currentLocation,
                        dockingUnitId: unitNumberForServer,
                        dockingPortId: portNumberForServer,
                        for: forNumber,
                        employee: loggedInUser.assignedUser
                    };
               /*});*/
               /* else {
                    sendingToServer = {
                        bicycleId: bicycle.id,
                        location: fromLocation,
                        from: $scope.bicycle.currentLocation,
                        toName: currentLocationName,
                        fromName: $scope.bicycle.currentLocationName,
                        currentLocationName: currentLocationName,
                        dockingPortId: $scope.bicycle.dockingPortId,
                        to: whereId,
                        for: forNumber,
                        employee: loggedInUser.assignedUser
                    };
                }*/

                console.log(sendingToServer);
                DataService.moveBicycle(sendingToServer).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.moveBicycleCancel = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Add Bicycle Controller
    app.controller('AddBicycle', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModal', function ($scope, $state, DataService, growl, sweet, $uibModal) {

        $scope.bicycle = {
            vehicleNumber: '',
            vechicleRFID: '',
            modelType: ''
            //purchaseDetails: {}
        };

        $scope.addBicycle = function () {
            var bicycle = $scope.bicycle;
            return $uibModal.open({
                templateUrl: 'bicycle-current-position.html',
                controller: 'MoveCurrentPosition',
                size: 'md',
                resolve: {
                    bicycleData: function () {
                        return bicycle;
                    }
                }
            });
        };

        $scope.cancelAddBicycle = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.bicycles.manage');
            });
        };

    }]);

    // Bicycle Current Position Controller
    app.controller('MoveCurrentPosition', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'bicycleData', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, bicycleData) {

        $scope.bicycle = bicycleData;

/*        DataService.getHoldingAreas().then(function (response) {
            if (!response.error) {
                $scope.holdingAreas = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });*/


        DataService.getFleets().then(function (response) {
            if (!response.error) {
                $scope.holdingAreas = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.saveHoldingAreaWithBicycle = function (selectHolding) {
            if (selectHolding) {
                $scope.bicycle.fleetId = selectHolding._id;
                $scope.bicycle.vehicleNumber=$scope.bicycle.bicycleNumber;
                $scope.bicycle.vehicleRFID=$scope.bicycle.cycleRFID;
                console.log($scope.bicycle);
                DataService.saveBicycle($scope.bicycle).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.go('admin.bicycles.edit', {'id': response.data._id});
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            } else {
                growl.warning("Please select holding area")
            }
        };

        $scope.cancelHoldingAreaSave = function () {
            $uibModalInstance.dismiss();
        };

    }]);

// Add Bicycle Controller
    app.controller('EditBicycle', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModal) {
        $scope.bicycle = {};

        DataService.getBicycle($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.bicycle = response.data;
                if (!$scope.bicycle.picture || $scope.bicycle.picture == '') {
                    $scope.profilePicUrl = 'assets/images/bicycle.jpg'
                } else {
                    $scope.profilePicUrl = AWS + 'Bicycle/' + response.data.picture + '.png';
                }
                /*if ($scope.bicycle.purchaseDetails) {
                    $scope.bicycle.purchaseDetails.manufacturingDate = new Date($scope.bicycle.purchaseDetails.manufacturingDate);
                    $scope.bicycle.purchaseDetails.invoiceDate = new Date($scope.bicycle.purchaseDetails.invoiceDate);
                    $scope.bicycle.purchaseDetails.receivedAt = new Date($scope.bicycle.purchaseDetails.receivedAt);
                }*/
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.removeProfilePic = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                closeOnConfirm: true
            }, function () {
                $scope.bicycle.picture = '';
                DataService.updateBicycle($scope.bicycle).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.updateBicycle = function () {
            DataService.updateBicycle($scope.bicycle).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelUpdateBicycle = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.bicycles.manage');
            });
        };
    }]);

    app.controller('ManageRedistributionVehicles', ['$scope', 'NgTableParams', '$state', 'DataService', 'growl', 'sweet', 'constantService', '$filter', '$uibModal', 'StatusService', function ($scope, NgTableParams, $state, DataService, growl, sweet, constantService, $filter, $uibModal, StatusService) {

        /*Docking Units Statuses*/
        $scope.DockPortStatus = constantService.DockPortStatus;

        $scope.redistributionVehicles = [];

        DataService.getRedistributionVehicles().then(function (response) {
            if (!response.error) {
                $scope.redistributionVehicles = response.data;

                $scope.redistributionVehicles.forEach(function (redistributionVehicle) {
                    redistributionVehicle.status = StatusService.getRedistributionVehicleStatus(redistributionVehicle.status);
                });
                $scope.redistributionVehiclesTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.redistributionVehiclesTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.redistributionVehicles, params.filter()) : $scope.redistributionVehicles;

                    this.vehiclePlate = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.vehicleNumber = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.driverId = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.modelType = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.holdingCapacity = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.noOfBicycle = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.latitude = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    $defer.resolve(this.vehiclePlate, this.vehicleNumber, this.driverId, this.modelType, this.holdingCapacity, this.noOfBicycle, this.latitude);
                }
            }
        );

        $scope.changeRedistributionVehicleStatus = function (id) {
            var selectedRedistributionVehicle = {};
            $scope.redistributionVehicles.forEach(function (redistributionVehicle) {
                if (redistributionVehicle._id === id) {
                    selectedRedistributionVehicle = redistributionVehicle;
                }
            });
            return $uibModal.open({
                templateUrl: 'redistribution-vehicle-status-modal.html',
                controller: 'RedistributionVehicleStatus',
                size: 'md',
                resolve: {
                    redistributionVehicle: function () {
                        return selectedRedistributionVehicle;
                    }
                }
            });
        };

        $scope.addRedistributionVehicle = function () {
            $state.go('admin.redistribution-vehicles.add')
        };

        $scope.editRedistributionVehicle = function (id) {
            $state.go('admin.redistribution-vehicles.edit', {'id': id});
        };


    }]);

// Docking Station Status Controller
    app.controller('RedistributionVehicleStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'redistributionVehicle', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, redistributionVehicle) {

        $scope.redistributionVehicle = redistributionVehicle;

        $scope.changeRedistributionVehicleStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.redistributionVehicle.status = parseInt($scope.redistributionVehicle.status);
                DataService.updateRedistributionVehicle($scope.redistributionVehicle).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelRedistributionVehicleStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('AddRedistributionVehicle', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.redistributionVehicle = {
           /* Name: '',*/
            /*name:'',*/
            StationId:'',
            vehiclePlate: '',
            driverId: '',
            assignedTo:'',
            zoneId:'',
         /*   modelType: '',*/
            portCapacity: '',
        /*    noOfBicycle: '',*/
          /*  purchaseDetails: {},*/
            gpsCoordinates: {
                longitude: '',
                latitude: ''
            }

        };

        $scope.saveRedistributionVehicle = function () {
            DataService.saveRedistributionVehicle($scope.redistributionVehicle).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.redistribution-vehicles.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.RedistributionStations = [];

        DataService.getRedistributionStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RedistributionStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRedistributionCentre =function(data){
            $scope.redistributionVehicle.StationId=data.id;
        };

        $scope.cancelAddRedistributionVehicle = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.redistribution-vehicles.manage');
            });
        };

        $scope.RVstaffSelections = [];

        DataService.getRedistributionVehicleStaff().then(function (response) {
                if (!response.error) {
                    $scope.RVstaffSelections = response.data;
                } else {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedStaff = function (data) {
            $scope.redistributionVehicle.assignedTo = data._id;
        };


    }]);

    app.controller('EditRedistributionVehicle', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal) {

        $scope.redistributionVehicle = {};
        $scope.redistributionVehicles=[];


        $scope.redistributionVehicleMap = {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 15
        };

        DataService.getRedistributionVehicle($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.redistributionVehicle = response.data;
                $scope.redistributionVehicles = response.data;
                $scope.redistributionVehicleMap.center.latitude = parseFloat($scope.redistributionVehicle.gpsCoordinates.latitude);
                $scope.redistributionVehicleMap.center.longitude = parseFloat($scope.redistributionVehicle.gpsCoordinates.longitude);

                /*if ($scope.redistributionVehicle.purchaseDetails) {
                    $scope.redistributionVehicle.purchaseDetails.manufacturingDate = new Date($scope.redistributionVehicle.purchaseDetails.manufacturingDate);
                    $scope.redistributionVehicle.purchaseDetails.invoiceDate = new Date($scope.redistributionVehicle.purchaseDetails.invoiceDate);
                    $scope.redistributionVehicle.purchaseDetails.receivedAt = new Date($scope.redistributionVehicle.purchaseDetails.receivedAt);
                }*/
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.updateRedistributionVehicle = function () {
            DataService.updateRedistributionVehicle($scope.redistributionVehicle).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelUpdateRedistributionVehicle = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.redistribution-vehicles.manage');
            });
        };

        $scope.changeRedistributionVehicleStatus = function () {
            return $uibModal.open({
                templateUrl: 'redistribution-vehicle-status-modal.html',
                controller: 'RedistributionVehicleStatus',
                size: 'md',
                resolve: {
                    redistributionVehicle: function () {
                        return $scope.redistributionVehicle;
                    }
                }
            });
        };

        $scope.RedistributionStations = [];

        DataService.getRedistributionStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RedistributionStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRedistributionCentre =function(data){
            $scope.redistributionVehicle.StationId=data.id;
        };

        $scope.RVstaffSelections = [];

        DataService.getRedistributionVehicleStaff().then(function (response) {
                if (!response.error) {
                    $scope.RVstaffSelections = response.data;
                } else {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedStaff = function (data) {
            $scope.redistributionVehicle.assignedTo = data._id;
        };

    }]);


// Manage FarePlans Controller
    app.controller('ManageFarePlans', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService) {
        $scope.farePlansData = [];

        DataService.getFarePlans().then(function (response) {
            if (!response.error) {
                $scope.farePlansData = response.data;
                $scope.farePlansData.forEach(function (farePlan) {
                    farePlan.status = StatusService.getFarePlanStatus(farePlan.status);
                });
                $scope.farePlansTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.farePlansTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.farePlansData, params.filter()) : $scope.farePlansData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.editFarePlan = function (id) {
            $state.go('admin.fare-plans.edit', {'id': id});
        };

        $scope.addNewFarePlan = function () {
            $state.go('admin.fare-plans.add');
        };

    }]);

// Add FarePlan Controller
    app.controller('AddFarePlan', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.farePlan = {
            planName: '',
            plans: []
        };

        $scope.addFarePlanDetails = function () {
            $scope.farePlan.plans.push({})
        };

        $scope.removePlan = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            });
            $scope.farePlan.plans.splice($index, 1);
        };

        $scope.addFarePlan = function () {
            DataService.saveFarePlan($scope.farePlan).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.fare-plans.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddFarePlan = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.fare-plans.manage');
            });
        };

    }]);

// Add FarePlan Controller
    app.controller('EditFarePlan', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModal) {
        $scope.farePlan = {};

        $scope.addFarePlanDetails = function () {
            $scope.farePlan.plans.push({})
        };

        $scope.removePlan = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            });
            $scope.farePlan.plans.splice($index, 1);
        };

        DataService.getFarePlan($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.farePlan = response.data;
                $scope.profilePicUrl = AWS + 'FarePlan/' + response.data.farePlanId + '/' + response.data.picture + '.png';
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.updateFarePlan = function () {
            DataService.updateFarePlan($scope.farePlan).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                   /* window.location.reload();*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelUpdateFarePlan = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.fare-plans.manage');
            });
        };

    }]);

    /*Holding Area Management*/

    app.controller('ManageHoldingAreas', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService) {
        $scope.holdingAreas = [];

        DataService.getHoldingAreas().then(function (response) {
            if (!response.error) {
                $scope.holdingAreas = response.data;
                $scope.holdingAreas.forEach(function (holdingArea) {
                    holdingArea.status = StatusService.getHoldingAreaStatus(holdingArea.status);
                    holdingArea.longitude = holdingArea.gpsCoordinates.longitude;
                    holdingArea.latitude = holdingArea.gpsCoordinates.latitude;
                });
                $scope.holdingAreasTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.holdingAreasTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.holdingAreas, params.filter()) : $scope.holdingAreas;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.changeHoldingAreaStatus = function (id) {
            var selectedHoldingArea = {};
            $scope.holdingAreas.forEach(function (holdingArea) {
                if (holdingArea._id === id) {
                    selectedHoldingArea = holdingArea;
                }
            });
            return $uibModal.open({
                templateUrl: 'holding-area-status-modal.html',
                controller: 'HoldingAreaStatus',
                size: 'md',
                resolve: {
                    holdingArea: function () {
                        return selectedHoldingArea;
                    }
                }
            });
        };

        $scope.editHoldingArea = function (id) {
            $state.go('admin.holding-areas.edit', {'id': id});
        };

        $scope.addNewHoldingArea = function () {
            $state.go('admin.holding-areas.add');
        };

    }]);

// Holding Area Status Controller
    app.controller('HoldingAreaStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'holdingArea', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, holdingArea) {

        $scope.holdingArea = holdingArea;

        $scope.changeHoldingAreaStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.holdingArea.status = parseInt($scope.holdingArea.status);
                DataService.updateHoldingArea($scope.holdingArea).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelHoldingAreaStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);


    app.controller('AddHoldingArea', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.holdingArea = {
            StationId:'',
            Name: '',
            portCapacity: 0,
          /*  modelType: '',
            minCyclesAlert: 0,*/
            status: 0,
           /* maxCyclesAlert: 0,*/
            gpsCoordinates: {
                latitude: '',
                longitude: ''
            }

        };

        $scope.addHoldingArea = function () {
            $scope.holdingArea.status = parseInt($scope.holdingArea.status);
            DataService.saveHoldingArea($scope.holdingArea).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.holding-areas.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.HoldingStations = [];

        DataService.getHoldingStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.HoldingStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedHoldingStation =function(data){
            $scope.holdingArea.StationId=data.id;
        };

        $scope.cancelAddHoldingArea = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.holding-areas.manage');
            });
        };

    }]);

    app.controller('EditHoldingArea', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal) {
        $scope.holdingArea = {};

        $scope.holdingAreaMap = {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 15
        };

        DataService.getHoldingArea($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.holdingArea = response.data;
                $scope.holdingAreaMap.center.latitude = parseFloat($scope.holdingArea.gpsCoordinates.latitude);
                $scope.holdingAreaMap.center.longitude = parseFloat($scope.holdingArea.gpsCoordinates.longitude);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.changeHoldingAreaStatus = function () {
            return $uibModal.open({
                templateUrl: 'holding-area-status-modal.html',
                controller: 'HoldingAreaStatus',
                size: 'md',
                resolve: {
                    holdingArea: function () {
                        return $scope.holdingArea;
                    }
                }
            });
        };

        $scope.updateHoldingArea = function () {
            DataService.updateHoldingArea($scope.holdingArea).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

        $scope.cancelUpdateHoldingArea = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.holding-areas.manage');
            });
        };

        $scope.HoldingStations = [];

        DataService.getHoldingStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.HoldingStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedHoldingStation =function(data){
            $scope.holdingArea.StationId=data.id;
        };


    }]);

    app.controller('ManageMaintenanceCentres', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService) {
        $scope.maintenanceCentres = [];

        DataService.getMaintenanceCentres().then(function (response) {
            if (!response.error) {
                $scope.maintenanceCentres = response.data;
                $scope.maintenanceCentres.forEach(function (maintenanceCentre) {
                    maintenanceCentre.status = StatusService.getMaintenanceCentresStatus(maintenanceCentre.status);
                    maintenanceCentre.longitude = maintenanceCentre.gpsCoordinates.longitude;
                    maintenanceCentre.latitude = maintenanceCentre.gpsCoordinates.latitude;
                });
                $scope.maintenanceCentresTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.maintenanceCentresTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.maintenanceCentres, params.filter()) : $scope.maintenanceCentres;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.changeMaintenanceCentreStatus = function (id) {
            var selectedMaintenanceCentre = {};
            $scope.maintenanceCentres.forEach(function (maintenanceCentre) {
                if (maintenanceCentre._id === id) {
                    selectedMaintenanceCentre = maintenanceCentre;
                }
            });
            return $uibModal.open({
                templateUrl: 'maintenance-centre-status-modal.html',
                controller: 'MaintenanceCentreStatus',
                size: 'md',
                resolve: {
                    maintenanceCentre: function () {
                        return selectedMaintenanceCentre;
                    }
                }
            });
        };

        $scope.editMaintenanceCentre = function (id) {
            $state.go('admin.maintenance-centres.edit', {'id': id});
        };

        $scope.addNewMaintenanceCentre = function () {
            $state.go('admin.maintenance-centres.add');
        };

    }]);

    // Registratiob Centres
    app.controller('ManageRegistrationCentres', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {
        $scope.registrationCentres = [];

        /*fetching registration center table details*/
        DataService.getRegistrationCentres().then(function (response) {
            if (!response.error) {
                $scope.registrationCentres = response.data;
                $scope.registrationCentres.forEach(function (registrationCentre) {
                    registrationCentre.status = StatusService.getRegistrationCentresStatus(registrationCentre.status);
                    registrationCentre.longitude = registrationCentre.gpsCoordinates.longitude;
                    registrationCentre.latitude = registrationCentre.gpsCoordinates.latitude;
                });
                $scope.registrationCentresTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.registrationCentresTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.registrationCentres, params.filter()) : $scope.registrationCentres;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.editRegistrationCentre = function (_id) {
            $state.go('admin.registration-centres.edit', {'id': _id});
        };


        $scope.addNewRegistrationCentre = function () {
            $state.go('admin.registration-centres.add');
        };
    }]);

    app.controller('AddRegistrationCentre', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet)
    {
        $scope.registrationCentre = {
            name: '',
            location: '',
            assignedTo: '',
            gpsCoordinates: {
                latitude: '',
                longitude: ''
            },
            status: 0
        };

        $scope.staffSelections = [];

        DataService.getStaffs().then(function (response) {
                if (!response.error) {
                    $scope.staffSelections = response.data;
                } else {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedStaff = function (data) {
            $scope.registrationCentre.assignedTo = data.id;
        };

        $scope.cancelAddRegistrationCentre = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.registration-centres.manage');
            });
        };

        $scope.addRegistrationCentre = function () {
            DataService.saveRegistrationCentre($scope.registrationCentre).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.registration-centres.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };
    }]);

    app.controller('EditRegistrationCentre', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal) {

        $scope.registrations = {};

        $scope.registrationCentreMap = {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 15
        };

        DataService.getRegistrationCentre($stateParams.id).then(function (response) {
            if (!response.error)
            {
                $scope.registrations = response.data[0];
                $scope.registrationCentreMap.center.latitude = parseFloat($scope.registrations[0].gpsCoordinates.latitude);
                $scope.registrationCentreMap.center.longitude = parseFloat($scope.registrations[0].gpsCoordinates.longitude);
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        /*$scope.changeMaintenanceCentreStatus = function () {
            return $uibModal.open({
                templateUrl: 'maintenance-centre-status-modal.html',
                controller: 'MaintenanceCentreStatus',
                size: 'md',
                resolve: {
                    maintenanceCentre: function () {
                        return $scope.maintenanceCentre;
                    }
                }
            });
        };*/

        $scope.updateRegistrationCentre = function () {
            DataService.updateRegistrationCentre($scope.registrations).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                   /* $state.reload();*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

        $scope.cancelUpdateRegistrationCentre = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.registration-centres.manage');
            });
        };

        $scope.staffSelections = [];

        DataService.getStaffs().then(function (response) {
                if (!response.error) {
                    $scope.staffSelections = response.data;
                } else {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedStaff = function (data) {
            $scope.registrations.assignedTo = data.id;
        };

    }]);

    /*Tickets*/
    app.controller('ManageTicketsDetails', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {
        $scope.ticketsDetails = [];

        $scope.addNewTicketDetails = function () {
            $state.go('admin.tickets.add');
        };

    /*   $scope.searchMember={
           name:''
       };

        $scope.SearchMember = function () {
            DataService.memberSearch($scope.searchMember).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };*/

    }]);

    var _search_member_name;
    var _global_search_member_name;
    app.controller('AddTicketsDetails',  ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {
        $scope.ticketsDetails = {
            SearchedmemberName:_global_search_member_name,
            memberId:'',
            ticketSubject:'',
            ticketDescription:'',
            priorityName:'',
            departmentName:'',
            type:''
        };

        $scope.cancelAddTickets = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.tickets.manage');
            });
        };

        $scope.smember =function () {
            alert("hi");
        };

        $scope.addNewTicketDetails = function () {
            DataService.saveTicketDetails($scope.ticketsDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.registration-centres.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.searchMember={
            name:''
        }

        $scope.SearchMember = function () {
            DataService.memberSearch($scope.searchMember).then(function (response) {
                if (!response.error) {
                    _search_member_name = $scope.searchMember.name;

                    /* $scope.SearchMember = function (size) {
                         $uibModal.open({
                             templateUrl: 'member-search-details.html',
                             controller: 'SearchMemberDetails',
                             size: size,
                             resolve: {
                                 items: function () {
                                     /!* return $scope.member.credit;*!/
                                 }
                             }
                         });
                     };*/

                    return $uibModal.open({
                        templateUrl: 'member-search-details.html',
                        controller: 'SearchMemberDetails',
                        size: 'md',
                        resolve: {
                            member: function () {
                                return _global_search_member_name;
                                alert(_global_search_member_name)
                            }
                        }
                    });

                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.departmentNames = [];
        $scope.valueSelections = [];
        $scope.keyValues = [];
        var Values;

        DataService.getGlobalKeyNameValues().then(function (response)
        {
            if (!response.error) {
                $scope.departmentNames = response.data;
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.selectedDepartment =function(data)
        {
            $scope.ticketsDetails.departmentName=data.name;

            for (var i=0;i<data.value.length;i++)
            {
                Values = data.value[i];
                $scope.valueSelections.push(Values);

                $scope.selectedValues=function (Values) {
                    $scope.ticketsDetails.type=Values;
                }
            }
        };

    }]);

    app.controller('EditTickets', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService) {

        $scope.cancelUpdateTickets = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.tickets.manage');
            });
        };
    }]);

    //check in check out
    app.controller('ManagePortsTest', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {
        /*$scope.checkIncheckOut = [];*/
        $scope.checkIncheckOut = [];

        $scope.addCheckInCheckOut = function ()
        {
        };
        $scope.addCheckIn = function ()
        {
        };
    }]);

    app.controller('AddCheckInCheckOut', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet)
    {
        var datetime = new Date();

       /* var myDate=new Date(datetime).toLocaleString();*/

        var myDate= new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        var Mydate = myDate.toString();

        $scope.checkInOut = {
            vehicleId:'',
            cardId:'',
            fromPort:'',
            checkOutTime : Mydate
        };

        $scope.members =[];
        $scope.bicycleNums=[];
        $scope.dockingStationSelections = [];
        $scope.portSelections =[];


        DataService.getDockingStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.dockingStationSelections = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

       /* DataService.getDockingPorts().then(function (response) {
                if (!response.error) {
                    $scope.portSelections = response.data;
                } else {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });*/

        DataService.getMembers().then(function (response) {
            if (!response.error) {
                $scope.members = response.data;
            }
            else {
                growl.error(response.message);
            }
        },
            function (response)
            {
                growl.error(response.data);
        });

        DataService.getBicycles().then(function (response) {
            if (!response.error) {
                $scope.bicycleNums = response.data;
            }
            else {
                growl.error(response.message)
            }
        },
            function(response)
            {
                growl.error(response.data);
        });

        $scope.selectedDockingStation = function (data)
        {
            for(var i = 0; i < data.portIds.length ; i++)
            {
                var portInfo = {
                    Name:data.portIds[i].dockingPortId.Name,
                    _id:data.portIds[i].dockingPortId._id
                };
          var a= $scope.portSelections.push(portInfo);

                $scope.selectedPort=function (a) {
                    $scope.checkInOut.fromPort=a._id;
                }
            }
        };



        $scope.selectedMembers =function(data){
            $scope.checkInOut.cardId=data.cardNum;
        };

        $scope.selectedBicycleNumber = function (data) {
            $scope.checkInOut.vehicleId=data.vehicleNumber;
        };



        $scope.addCheckInCheckOut = function ()
        {
                DataService.saveCheckInCheckOut($scope.checkInOut).then(function (response) {
                    var test = $scope.checkInOut.cardId;
                    if (!response.error)
                    {
                        growl.success(response.message);
                        $scope.checkMember=$scope.members[0].value;
                        $scope.bicycleNo=$scope.bicycleNums[0].value;
                        $scope.dockingStationName=$scope.dockingStationSelections[0].value;
                        $scope.portsName=$scope.portSelections[0].value;
                    }
                    else
                    {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                })
        };

        $scope.addCheckIn = function ()
        {
            DataService.saveCheckIn($scope.checkInOut).then(function (response)
            {
                if (!response.error)
                {
                    growl.success(response.message);
                    $scope.checkMember=$scope.members[0].value;
                    $scope.bicycleNo=$scope.bicycleNums[0].value;
                    $scope.dockingStationName=$scope.dockingStationSelections[0].value;
                    $scope.portsName=$scope.portSelections[0].value;
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };
    }]);

    /*check in check out - bridge*/
    app.controller('CheckInCheckOutBridge', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {
        $scope.checkInOutBridge = {
            vehicleId:'',
            cardId:'',
            fromPort:'',
            bridgeDate:'',
            bridgeTime:'',
           /* checkOutTime : $filter('datetime')(new Date(),'HH:mm:ss:SSS')*/
             checkOutTime : new Date()
        };

        $scope.members =[];

        DataService.getMembers().then(function (response) {
                if (!response.error) {
                    $scope.members = response.data;
                }
                else {
                    growl.error(response.message);
                }
            },
            function (response)
            {
                growl.error(response.data);
            });

        $scope.selectedUserID = function (data) {
            $scope.checkInOutBridge.cardId=data.UserID;
        };

        $scope.bicycleNums=[];

        DataService.getBicycles().then(function (response) {
                if (!response.error) {
                    $scope.bicycleNums = response.data;
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedBicycle = function (data) {
            $scope.checkInOutBridge.vehicleId=data.vehicleUid;
        };

        $scope.dockingStationSelections = [];

        DataService.getDockingStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.dockingStationSelections = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.portSelections =[];

        $scope.selectedDockingStation = function (data)
        {
            for(var i = 0; i < data.portIds.length ; i++)
            {
                var portInfo = {
                    PortID:data.portIds[i].dockingPortId.PortID
                  /*  _id:data.portIds[i].dockingPortId._id*/
                };
                $scope.portSelections.push(portInfo);
            }
        };

        $scope.selectedPort = function (data) {
            $scope.checkInOutBridge.fromPort = data.PortID;
        };

        $scope.addCheckInCheckOutBridge = function ()
        {
            DataService.saveCheckOutBridge($scope.checkInOutBridge).then(function (response) {
                if (!response.error)
                {
                    growl.success(response.message);
                    $scope.userId=$scope.members[0].value;
                    $scope.bicycleNo=$scope.bicycleNums[0].value;
                    $scope.dockingStationName=$scope.dockingStationSelections[0].value;
                    $scope.portsName=$scope.portSelections[0].value;
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.addCheckInBridge = function ()
        {
            DataService.saveCheckInBridge($scope.checkInOutBridge).then(function (response)
            {
                if (!response.error)
                {
                    growl.success(response.message);
                    $scope.userId=$scope.members[0].value;
                    $scope.bicycleNo=$scope.bicycleNums[0].value;
                    $scope.dockingStationName=$scope.dockingStationSelections[0].value;
                    $scope.portsName=$scope.portSelections[0].value;
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

    }]);


    //kpi
    app.controller('ManageKPI', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {

    }]);

    var percentage_value=0;
    var percentage_points=0;

    var percentage_value_major_empty=0;
    var percentage_points_total_major_empty=0;
    var percentage_value_major_empty_offpeek=0;
    var percentage_points_total_major_empty_offpeek=0;

    var percentage_value_minor_empty=0;
    var percentage_points_total_minor_empty=0;
    var percentage_value_minor_empty_offpeek=0;
    var percentage_points_total_minor_empty_offpeek=0;

    var _no_of_days;
    var docking_station_count;
    app.controller('kpiDetails', ['$scope', '$state', 'DataService', 'growl','$uibModal','NgTableParams', 'sweet', function ($scope, $state, DataService, growl,$uibModal,NgTableParams,sweet)
    {
        /*alert(Number_of_DockingStations);*/

        $scope.toDateKPI = new Date();

        var CurrentDate = new Date();
     //   alert(CurrentDate);
       var test = CurrentDate.getMonth() + 1;
     //   alert(test);
        var demo = CurrentDate.getDate();
       // alert(demo);

        if(test == 10)
        {
            var aa= new Date(CurrentDate.setDate(CurrentDate.getDate() - demo));
            $scope.fromDateKPI  = new Date(CurrentDate.setMonth(CurrentDate.getMonth()));
        }

        else if(test == 11)
        {
            var aa1= new Date(CurrentDate.setDate(CurrentDate.getDate() - demo));
            $scope.fromDateKPI  = new Date(CurrentDate.setMonth(CurrentDate.getMonth() - 1));
        }
        else {
           // var test2;
            $scope.fromDateKPI   = new Date(CurrentDate.setMonth(CurrentDate.getMonth() - 2));
         /*  alert($scope.fromDateKPI);*/
        }


      /*  $scope.kpiDetails={
            fromDateKPI:'',
            toDateKPI:''
        };

        $scope.sendKpiDetails = function () {
            DataService.SendKPIDetails($scope.kpiDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };*/

        $scope.press = function (size) {
            $uibModal.open({
                templateUrl: 'details.html',
                controller: 'RVDetails',
                size: size,
                resolve: {
                    items: function () {
                        /*return $scope.member.debit;*/
                    }
                }
            });
        };

        $scope.details={
            fromdate:'',
            todate:'',
            stationState:0,
            duration:0
        };

        $scope.GetDetails = function ()
        {
            DataService.GetRVDetails($scope.details).then(function (response)
            {
                var one_day = 24*60*60*1000;

                var _from_date = $scope.details.fromdate.getDate();
                var _from_month = $scope.details.fromdate.getMonth();
                var _from_year = $scope.details.fromdate.getFullYear();
                var from_date=new Date(_from_year,_from_month,_from_date);

                var _to_date =$scope.details.todate.getDate();
                var _to_month =$scope.details.todate.getMonth();
                var _to_year =$scope.details.todate.getFullYear();
                var to_date=new Date(_to_year,_to_month,_to_date);

                var _no_of_days=Math.round(Math.abs((from_date.getTime()-to_date.getTime())/(one_day)))+1;
                /*_no_of_days = (_to_date) - (_from_date) + 1 ;*/
                var _working_hours = _no_of_days * 16 * 60 * Number_of_DockingStations;
                var i=0;
                var total=0;
                var total_major_empty_peak=0;
                var total_major_empty_offpeak=0;
                var total_minor_empty_peak=0;
                var total_minor_empty_offpeak=0;

                for(var i = 0; i < response.data.length; i++)
                {
                    var total_duration = response.data[i].timeduration;
                    var peakduration_empty = response.data[i].peekduration;
                    var offpeakduration_empty = response.data[i].offpeekduration;
                    var bicycle_clean=response.data[i].stationid.name;

                    // calculation for stations neither empty nor full for more then 1 minute
                    /*if(total_duration > 1)*/
                    if(total_duration > 120)
                    {
                    total += total_duration;
                    }

                    // calculation for major stations empty during peak hour
                    if(response.data[i].stationtype === "Major")
                    {
                     if(response.data[i].status===2)
                     {
                         total_major_empty_peak += peakduration_empty;
                         total_major_empty_offpeak += offpeakduration_empty;
                     }
                    }

                    // calculation for minor stations empty during peak and off peak hours
                    if(response.data[i].stationtype === "Minor")
                    {
                        if(response.data[i].status===2)
                        {
                            total_minor_empty_peak += peakduration_empty;
                            total_minor_empty_offpeak += offpeakduration_empty;
                        }
                    }
                }

                percentage_value =  ((_working_hours - total)/(_working_hours) * 100).toFixed(2);

                percentage_value_major_empty =  ((total_major_empty_peak)/(_working_hours) * 100).toFixed(2);
                percentage_value_major_empty_offpeek =  ((total_major_empty_offpeak)/(_working_hours) * 100).toFixed(2);

                percentage_value_minor_empty=((total_minor_empty_peak)/(_working_hours) * 100).toFixed(2);
                percentage_value_minor_empty_offpeek=((total_minor_empty_offpeak)/(_working_hours) * 100).toFixed(2);

                // condition for neither empty nor full for a period of longer than 2 hours
                if(percentage_value > 98)
                {
                percentage_points=10;
                }
                else if (percentage_value >= 95 && value < 98)
                {
                    percentage_points=5;
                }
                else if(percentage_value >=90 && percentage_value <95)
                {
                    percentage_points=-5;
                }
                else if(percentage_value < 90)
                {
                    percentage_points=-10;
                }


                // condition for major docking staions are empty during peak hours
                if (percentage_value_major_empty < 3)
                {
                    percentage_points_total_major_empty = 10;
                }
                else if(percentage_value_major_empty >= 3 && percentage_value_major_empty <5)
                {
                    percentage_points_total_major_empty=5;
                }
                else if(percentage_value_major_empty >= 5 && percentage_value_major_empty <8)
                {
                    percentage_points_total_major_empty=-5;
                }
                else if(percentage_value_major_empty >= 8)
                {
                    percentage_points_total_major_empty=-10;
                }

                // condition for major docking staions are empty during off peak hours
                if (percentage_value_major_empty_offpeek < 2)
                {
                    percentage_points_total_major_empty_offpeek = 10;
                }
                else if(percentage_value_major_empty_offpeek >= 2 && percentage_value_major_empty_offpeek <3)
                {
                    percentage_points_total_major_empty_offpeek=5;
                }
                else if(percentage_value_major_empty_offpeek >= 3 && percentage_value_major_empty_offpeek <5)
                {
                    percentage_points_total_major_empty_offpeek=-5;
                }
                else if(percentage_value_major_empty_offpeek >= 5)
                {
                    percentage_points_total_major_empty_offpeek=-10;
                }

                // condition for minor docking staions are empty during peak hours
                if (percentage_value_minor_empty < 10)
                {
                    percentage_points_total_minor_empty = 10;
                }
                else if(percentage_value_minor_empty >= 10 && percentage_value_minor_empty <20)
                {
                    percentage_points_total_minor_empty=5;
                }
                else if(percentage_value_minor_empty >= 20 && percentage_value_minor_empty <25)
                {
                    percentage_points_total_minor_empty=-5;
                }
                else if(percentage_value_minor_empty >= 25)
                {
                    percentage_points_total_minor_empty=-10;
                }

                // condition for minor docking staions are empty during off peak hours
                if (percentage_value_minor_empty_offpeek < 5)
                {
                    percentage_points_total_minor_empty_offpeek = 10;
                }
                else if(percentage_value_minor_empty_offpeek > 5 && percentage_value_minor_empty_offpeek <=8)
                {
                    percentage_points_total_minor_empty_offpeek=5;
                }
                else if(percentage_value_minor_empty_offpeek >8 && percentage_value_minor_empty_offpeek <=10)
                {
                    percentage_points_total_minor_empty_offpeek=-5;
                }
                else if(percentage_value_minor_empty_offpeek >= 10)
                {
                    percentage_points_total_minor_empty_offpeek=-10;
                }

                $scope.RVDetails={
                    percentage:percentage_value + "%",
                    points:percentage_points,
                    percentage_total_major_empty:percentage_value_major_empty + "%",
                    points_total_major_empty:percentage_points_total_major_empty,
                    percentage_total_major_empty_offpeek:percentage_value_major_empty_offpeek + "%",
                    points_total_major_empty_offpeek:percentage_points_total_major_empty_offpeek,
                    percentage_total_minor_empty:percentage_value_minor_empty + "%",
                    points_total_minor_empty:percentage_points_total_minor_empty,
                    percentage_total_minor_empty_offpeek:percentage_value_minor_empty_offpeek + "%",
                    points_total_minor_empty_offpeek:percentage_points_total_minor_empty_offpeek
                };

                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })

            // get smart card details
            var percentage_data;
            var percentage_points;
            DataService.GetKPISmartCardReport($scope.details).then(function (response)
            {
                percentage_data = response.data.toFixed(2);
                if(percentage_data > 99)
                {
                    percentage_points= 10;
                }
                else if(percentage_data <99)
                {
                    percentage_points=-10;
                }
                $scope.SmartCardInfo={
                   value:percentage_data + "%",
                    points:percentage_points
                };

                if (!response.error)
                {
                    growl.success(response.message);
                }
                else
                    {
                    growl.error(response.message);
                }
            }, function (response) {
                /*growl.error(response.data.description);*/
            });

            // get bicycle fleet @ 6 am
            var percentage_data;
            var percentage_points;
            var fleet_percentage;
            var fleet_points;
            DataService.GetBicycleDetailsAtFleet($scope.details).then(function (response)
            {
                var port_with_cycle = 0;
                var cycles_with_rv =0;
                var cycles_with_ha=0;
                var cycles_with_member=0;
                var fleet_size=0;
                for(var i = 0; i < response.data.length; i++)
                {
                    var _cycle_in_port_count = response.data[i].cyclesInPort;
                    var _cycle_with_rv = response.data[i].cyclesWithRv;
                    var _cycle_with_Ha = response.data[i].cyclesWithHa;
                    var _cycle_with_member=response.data[i].cyclesWithMembers;
                    var _fleet_size = response.data[i].requiredFleetSize;

                    port_with_cycle += _cycle_in_port_count;
                    cycles_with_rv +=_cycle_with_rv;
                    cycles_with_ha += _cycle_with_Ha;
                    cycles_with_member += _cycle_with_member;
                    fleet_size += _fleet_size;
                }

                fleet_percentage = ((port_with_cycle + cycles_with_rv + cycles_with_ha + cycles_with_member)/(fleet_size) * 100).toFixed(2);

                if(fleet_percentage > 95 && fleet_percentage <= 98)
                {
                    fleet_points = 5;
                }
                else if(fleet_percentage > 98)
                {
                    fleet_points = 10;
                }

                if(fleet_percentage > 90 && fleet_percentage <= 95)
                {
                    fleet_points = -5;
                }

                if(fleet_percentage < 90)
                {
                    fleet_points = -10;
                }

                $scope.bicycleFleet={
                    bicycleFleetValue:fleet_percentage + "%",
                    bicycleFleetPoints:fleet_points
                };

                if (!response.error)
                {
                    growl.success(response.message);
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /*growl.error(response.data.description);*/
            });

            // get docking station clean details
            var _docking_station_clean_count;
            var clean_percentage_value;
            var clean_percentage_points;
            DataService.GetDockingStationKPIDetails($scope.details).then(function (response)
            {
                 _docking_station_clean_count = response.data.length;

                clean_percentage_value = ((_docking_station_clean_count)/(_no_of_days * Number_of_DockingStations) * 100).toFixed(2);

                if(clean_percentage_value >= 1)
                {
                    clean_percentage_points = 10;
                }
                else if (clean_percentage_value >= 2)
                {
                    clean_percentage_points =5;
                }
                else if (clean_percentage_value >= 4)
                {
                    clean_percentage_points =-5;
                }
                else if (clean_percentage_value > 5)
                {
                    clean_percentage_points =-10;
                }

                $scope.KPIStationClean={
                    CleanValue:clean_percentage_value + "%",
                    CleanPoints:clean_percentage_points
                };

                if (!response.error)
                {
                    growl.success(response.message);
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /*growl.error(response.data.description);*/
            });

            // get average cycle use per cycle per day
            var _No_of_trips;
            var _No_of_cycles_required;
            var total_trips=0;
            var total_cycles=0;
            var trip_percentage;
            var trip_points;
            DataService.GetCycleUsagePerDay($scope.details).then(function (response)
            {
                for(var i=0;i<response.data.length;i++)
                {
                    _No_of_trips = response.data[i].noOfTrips;
                    _No_of_cycles_required = response.data[i].requiredNoOfCycles;

                    total_trips += _No_of_trips;
                    total_cycles += _No_of_cycles_required;
                }

                trip_percentage = ((total_trips/total_cycles)*100).toFixed(2);

                if(trip_percentage >= 3)
                {
                    trip_points = 10;
                }
                if(trip_percentage < 3)
                {
                    trip_points = -10;
                }

                $scope.CycleTrips={
                    trip_value:trip_percentage + "%",
                    trip_points:trip_points
                }

                if (!response.error)
                {
                    growl.success(response.message);
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /*growl.error(response.data.description);*/
            });

            // smart card at kiosks
            var _smart_card_kiosk_data;
            var _smart_card_kiosk_points;
            DataService.GetSmartCardAtKiosks($scope.details).then(function (response)
            {
                 _smart_card_kiosk_data = response.data;

                if(_smart_card_kiosk_data > 99)
                {
                    _smart_card_kiosk_points=10;
                }
                else if(_smart_card_kiosk_data < 99)
                {
                    _smart_card_kiosk_points = -10;
                }

                $scope.SmartCardKiosk={
                    kiosk_value:_smart_card_kiosk_data + "%",
                    kiosk_point:_smart_card_kiosk_points
                }

                if (!response.error)
                {
                    growl.success(response.message);
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                /*growl.error(response.data.description);*/
            });

        }
    }]);


    app.controller('RVDetails', ['$scope', '$state', 'DataService', 'growl','$uibModal', 'sweet', function ($scope, $state, DataService, growl,$uibModal,sweet)
    {


    }]);

    // global ticket type manage
    app.controller('TicketTypeManage', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.addGlobalKeyNameValue = function () {
            $state.go('admin.settings.ticket-type.add');
        };

        $scope.GlobalNameValue = [];

        DataService.getGlobalKeyNameValues().then(function (response)
        {
            if (!response.error) {
                $scope.GlobalNameValue = response.data;
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.NameValueTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.GlobalNameValue, params.filter()) : $scope.GlobalNameValue;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );


    }]);

    // global ticket type add
    app.controller('TicketTypeAdd', ['$scope', '$state', 'DataService', 'growl','$uibModal', 'sweet', function ($scope, $state, DataService, growl,$uibModal,sweet)
    {
        $scope.globalKeyValues={
            name: '',
            value: []
        };

        $scope.addGlobalTypeDetails = function () {
            $scope.globalKeyValues.value.push({});
        };

        $scope.removeValue = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            });
            $scope.globalKeyValues.value.splice($index, 1);
        };

        $scope.globalKeyValues;


        $scope.saveGlobalNameValue = function () {
            DataService.saveGlobalKeyNameValue($scope.globalKeyValues).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddTicketType = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.settings.ticket-type.manage');
            });
        };
    }]);

    // setting type edit
    app.controller('SettingTypeEdit', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal, StatusService)
    {
        $scope.globalKeyValues = {};

        $scope.addGlobalTypeDetails = function () {
            $scope.globalKeyValues.value.push({});
        };

        $scope.removePlan = function ($index) {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: true
            });
            $scope.globalKeyValues.value.splice($index, 1);
        };

        DataService.getSettingType($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.globalKeyValues = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });


        $scope.cancelUpdateSettingtype = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.settings.ticket-type.manage');
            });
        };
    }]);



// Maintenance Centre Status Controller
    app.controller('MaintenanceCentreStatus', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'maintenanceCentre', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, maintenanceCentre) {

        $scope.maintenanceCentre = maintenanceCentre;

        $scope.changeMaintenanceCentreStatus = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Changing the status may have side effects',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, change!',
                closeOnConfirm: true
            }, function () {
                $scope.maintenanceCentre.status = parseInt($scope.maintenanceCentre.status);
                DataService.updateMaintenanceCentre($scope.maintenanceCentre).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $uibModalInstance.dismiss();
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.cancelMaintenanceCentreStatusChange = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('AddMaintenanceCentre', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.maintenanceCentre = {
            Name: '',
            portCapacity: 0,
        /*    noOfCycles: 0,*/
            StationId:'',
            gpsCoordinates: {
                latitude: '',
                longitude: ''
            },
            status: 0

        };

        $scope.addMaintenanceCentre = function () {
            DataService.saveMaintenanceCentre($scope.maintenanceCentre).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.maintenance-centres.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.MaintenanceStations = [];

        DataService.getMaintenanceStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.MaintenanceStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedMaintenanceStation =function(data){
            $scope.maintenanceCentre.StationId=data.id;
        };

        $scope.cancelAddMaintenanceCentre = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.maintenance-centres.manage');
            });
        };

    }]);

    app.controller('EditMaintenanceCentre', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal) {
        $scope.maintenanceCentre = {};

        $scope.maintenanceCentreMap = {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 15
        };

        DataService.getMaintenanceCentre($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.maintenanceCentre = response.data;
                $scope.maintenanceCentreMap.center.latitude = parseFloat($scope.maintenanceCentre.gpsCoordinates.latitude);
                $scope.maintenanceCentreMap.center.longitude = parseFloat($scope.maintenanceCentre.gpsCoordinates.longitude);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.changeMaintenanceCentreStatus = function () {
            return $uibModal.open({
                templateUrl: 'maintenance-centre-status-modal.html',
                controller: 'MaintenanceCentreStatus',
                size: 'md',
                resolve: {
                    maintenanceCentre: function () {
                        return $scope.maintenanceCentre;
                    }
                }
            });
        };

        $scope.updateMaintenanceCentre = function () {
            DataService.updateMaintenanceCentre($scope.maintenanceCentre).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

        $scope.cancelUpdateMaintenanceCentre = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.maintenance-centres.manage');
            });
        };

        $scope.MaintenanceStations = [];

        DataService.getMaintenanceStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.MaintenanceStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedMaintenanceStation =function(data){
            $scope.maintenanceCentre.StationId=data.id;
        };

    }]);

    app.controller('ManageSmartCards', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService) {
        $scope.smartCards = [];

        var filters = {
            filter: {
                populate: {path: 'assignedTo'}
            }
        };

        DataService.getSmartCards(filters).then(function (response) {
            if (!response.error) {
                $scope.smartCards = response.data;
                $scope.smartCards.forEach(function (smartCard) {
                    smartCard.status = StatusService.getSmartCardStatus(smartCard.status);
                    smartCard.cardType = StatusService.getCardType(smartCard.cardType);
                    smartCard.cardLevel = StatusService.getCardLevel(smartCard.cardLevel);
                    if (smartCard.assignedTo) {
                        smartCard.name = smartCard.assignedTo.name;
                        smartCard.lastName = smartCard.assignedTo.lastName;
                    }
                });
                $scope.smartCardsTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.smartCardsTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.smartCards, params.filter()) : $scope.smartCards;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.editSmartCard = function (id) {
            $state.go('admin.smart-cards.edit', {'id': id});
        };

        $scope.addSmartCard = function () {
            $state.go('admin.smart-cards.add');
        };

    }]);

    app.controller('AddSmartCard', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet) {

        $scope.smartCard = {
            cardNumber: '',
            cardRFID:''/*,
            cardType: '',
            cardLevel: ''
*/        };

        $scope.addSmartCard = function () {
           /* $scope.smartCard.cardLevel = parseInt($scope.smartCard.cardLevel);
            $scope.smartCard.cardType = parseInt($scope.smartCard.cardType);*/
            DataService.saveSmartCard($scope.smartCard).then(function (response) {
                login_email;
                if (!response.error) {
                    growl.success(response.message);
                    $state.go('admin.smart-cards.edit', {'id': response.data._id});
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddSmartCard = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.smart-cards.manage');
            });
        };

    }]);

    app.controller('EditSmartCard', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal, StatusService) {

        $scope.smartCard = {};

        DataService.getSmartCard($stateParams.id).then(function (response) {
            if (!response.error) {
                $scope.smartCard = response.data;
                $scope.smartCard.cardType = StatusService.getCardType($scope.smartCard.cardType);
                $scope.smartCard.cardLevel = StatusService.getCardLevel($scope.smartCard.cardLevel);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.updateSmartCard = function () {
           /* $scope.smartCard.cardType = StatusService.getCardTypeToNum($scope.smartCard.cardType);*/
           /* $scope.smartCard.cardLevel = StatusService.getCardLevelToNum($scope.smartCard.cardLevel);*/
            DataService.updateSmartCard($scope.smartCard).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

        $scope.cancelUpdateSmartCard = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.smart-cards.manage');
            });
        };

    }]);


    app.controller('InternalStationManage', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {

        $scope.InternalStations =[];

        DataService.getInternalStations().then(function (response) {
            if (!response.error)
            {
                growl.success(response.message);
                $scope.InternalStations = response.data;
                $scope.internalStationsTable = new NgTableParams(
                    {
                        count: 10
                    },
                    {
                        getData: function ($defer, params) {
                            var orderedData = params.filter() ? $filter('filter')($scope.InternalStations, params.filter()) : $scope.InternalStations;
                            params.total(orderedData.length);
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    }
                );
            }
            else
            {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        })

        $scope.addNewInternalStations = function () {
            $state.go('admin.internal-stations.add');
        };
    }]);

    app.controller('InternalStationAdd', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {

        $scope.internalStationsDetails = {
            name: '',
            type:'',
            gpsCoordinates: {
                latitude: '',
                longitude: ''
            }

        };

        $scope.SaveInternalStations = function () {
            DataService.saveInternalstaions($scope.internalStationsDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    /* $state.go('admin.holding-areas.edit', {'id': response.data._id});*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddInternalStations = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.internal-stations.manage');
            });
        };
    }]);


    app.controller('FleetsManage', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {
        $scope.FleetsAreas = [];

        DataService.getFleetAreas().then(function (response) {
            if (!response.error) {
                $scope.FleetsAreas = response.data;
              /*  $scope.FleetsTable.reload();*/
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.FleetsTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.FleetsAreas, params.filter()) : $scope.FleetsAreas;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.addNewFleets = function () {
            $state.go('admin.fleets.add');
        };
    }]);

    app.controller('FleetsAdd', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {

        $scope.fleetDetails = {
            Name: '',
            portCapacity:'',
            StationId:''
        };

        $scope.SaveFleetDetails = function () {
            DataService.saveFleets($scope.fleetDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    /* $state.go('admin.holding-areas.edit', {'id': response.data._id});*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.FleetStations = [];

        DataService.getFleetsStations().then(function (response)
            {
                if (!response.error)
                {
                    $scope.FleetStations = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedFleetStation =function(data){
            $scope.fleetDetails.StationId=data.id;
        };

        $scope.cancelAddNewFleets = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.fleets.manage');
            });
        };
    }]);

    app.controller('EditFleets', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, $uibModal, StatusService)
    {

        $scope.editFleets = {};

        DataService.getFleet($stateParams.id).then(function (response) {
            if (!response.error)
            {
                $scope.editFleets = response.data;
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.cancelUpdateFleets = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.fleets.manage');
            });
        };

    }]);

    app.controller('ManageReports', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter) {
        $scope.stations = {};

        DataService.getStationsCount().then(function (response) {
            if (!response.error) {
                $scope.stations.count = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        })

    }]);

    app.controller('MonitorTransactions', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        var filters = {
            filter: {
                populate: {path: 'bicycle fromPort member'}
            }
        };
        $scope.transactions = [];

        DataService.getAllMemberTransactions(filters).then(function (response) {
            if (!response.error) {
                $scope.transactions = response.data;
                var ToDate = transaction.toPort;
                $scope.transactions.forEach(function (transaction) {
                    transaction.checkOutTime = new Date(transaction.checkOutTime);
                    transaction.checkOutTime = transaction.checkOutTime.toLocaleDateString();
                    if (transaction.checkInTime !== undefined) {
                        transaction.checkInTime = new Date(transaction.checkInTime);
                        transaction.checkInTime = transaction.checkInTime.toLocaleDateString();
                    }
                    transaction.status = StatusService.getTransactionStatus(transaction.status);
                });
                $scope.transactionsTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.loadTransactions = function () {
            $state.reload();
        };

        $scope.transactionsTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    params.total($scope.transactions.length);
                    $defer.resolve($scope.transactions.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.transactionDetails = function (data) {
            return $uibModal.open({
                templateUrl: 'transaction-details-modal.html',
                controller: 'TransactionDetails',
                size: 'md',
                resolve: {
                    transactionId: function () {
                        return data;
                    }
                }
            });
        };

        $scope.closeTransaction = function (data) {
            return $uibModal.open({
                templateUrl: 'close-transaction-modal.html',
                controller: 'CloseTransaction',
                size: 'md',
                resolve: {
                    transactionId: function () {
                        return data;
                    }
                }
            });
        };

    }]);

    /*Accounts*/

    app.controller('CashCollectionSummary', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        $scope.cashCollection={
            fromDateCashCollection:'',
            toDateCashCollection:'',
            RegCentre:''
        };

        $scope.sendDetails = function () {
            DataService.SendCashCollectionDetails($scope.cashCollection).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.cashCollection.RegCentre = data.location;
        };

    }]);

    var DayWise=[];
    var _daywise_fromDate;
    var _daywise_toDate;
    var _location;
    var _transaction_type;
    app.controller('dayWiseCollectionSummary', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        $scope.daywiseCollection={
            fromdate:'',
            todate:'',
            location:'',
            transactionType:''
        };

        /*$scope.sendDaywiseDetails = function () {
            DataService.SendDaywiseCashCollectionDetails($scope.daywiseCollection).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };*/


        $scope.daywises =[];

        $scope.sendDaywiseDetails = function ()
        {
            DataService.SendDaywiseCashCollectionDetails($scope.daywiseCollection).then(function (response) {
                if (!response.error)
                {
                    growl.success(response.message);

                     _daywise_fromDate=$scope.daywiseCollection.fromdate;
                     _daywise_toDate=$scope.daywiseCollection.todate;
                     _location=$scope.daywiseCollection.location;
                    _transaction_type=$scope.daywiseCollection.transactionType;

                    $scope.daywises = response.data;

                    DayWise=response.data;

                    $scope.daywiseTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.daywises, params.filter()) : $scope.daywises;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        }
                    );
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.daywiseCollection.location = data.location;
        };
    }]);

    app.controller('refundsSummary', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        $scope.RegistrationCenters=[];

        $scope.refundDetails={
            fromDate:'',
            toDate:'',
            RegCenter:''
        };

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.refundDetails.RegCenter = data.location;
        };


    }]);


    var _totalcash_fromdate;
    var _total_cash_todate;
    var _totalcash_location;
    var TotalCash =[];
    app.controller('totalCashReport', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.totalCashInput=
        {
            fromdate:'',
            todate:'',
            location:''
        };

        $scope.cashTotals =[];

        $scope.sendTotalCashDetails = function ()
        {
            DataService.SendTotalCashCollectionDetails($scope.totalCashInput).then(function (response) {
                if (!response.error)
                    {
                    growl.success(response.message);
                        _totalcash_fromdate=$scope.totalCashInput.fromdate;
                        _total_cash_todate=$scope.totalCashInput.todate;
                        _totalcash_location=$scope.totalCashInput.location;
                    $scope.cashTotals = response.data;

                        TotalCash = response.data;
                    /*cc=response.data;*/

                        $scope.totalCashTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.cashTotals, params.filter()) : $scope.cashTotals;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        }
                    );
                    }
                    else
                    {
                    growl.error(response.message);
                    }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.totalCashInput.location = data.location;
        };


        $scope.MyFunction = function ()
        {
            // $scope.IsVisible = $scope.IsVisible ? false : true;
          /*  $window.location.href = '/accounts/bankcashdeposits/totalcash-report-print.html';*/
           /* window.print();*/
        };


    }]);


    app.controller('totalCashReportPrint', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.totalCashPrintInput=
        {
            TotalCashfromdate:_totalcash_fromdate,
            TotalCashtodate:_total_cash_todate,
            TotalCashlocation:_totalcash_location
        };

        $scope.TotalCashPrint=[];
        $scope.TotalCashPrint=TotalCash;

       /* $scope.totalCashTable =$scope.New1;*/


        $scope.totalCashTable = new NgTableParams(
                        {
                            count: 500,
                            noPager: true
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.TotalCashPrint, params.filter()) : $scope.TotalCashPrint;
                              /*params.total(orderedData.length);*/
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        }
                    );

        $scope.myFun = function ()
        {
             window.print();
        };
        $scope.myFun1 = function ()
        {
            $state.go('admin.accounts.totalcash-report');
        };
    }]);


    // daywise-collection summary report print
    app.controller('DaywsieCollectionSummaryReportPrint', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.daywiseCollectionSummaryInput=
            {
                DayWisefromdate:_daywise_fromDate,
                DayWisetodate:_daywise_toDate,
                DayWiselocation:_location,
                DayWiseTransactionType:_transaction_type
            };

        $scope.DayWiseSummaryPrint=[];
        $scope.DayWiseSummaryPrint=DayWise;

        $scope.DayWiseCollectionSummaryPrintTable = new NgTableParams(
            {
                count: 500,
                noPager: true
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.DayWiseSummaryPrint, params.filter()) : $scope.DayWiseSummaryPrint;
                    /*params.total(orderedData.length);*/
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.myFun = function ()
        {
            window.print();
        };

    }]);

    // bank cash deposit deposit report print
    app.controller('BankCashDepositReportPrint', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.bankCashDepositInput=
            {
                bankCashDepositfromdate:_bankcashdeposit_fromdate,
                bankCashDeposittodate:_bankcashdeposit_todate,
                bankCashDepositlocation:_bankcashdeposit_location,
            };

        $scope.BankCashDepositPrint=[];
        $scope.BankCashDepositPrint=BankcashDeposit;

        $scope.BankCashDepositPrintTable = new NgTableParams(
            {
                count: 500,
                noPager: true
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.BankCashDepositPrint, params.filter()) : $scope.BankCashDepositPrint;
                    /*params.total(orderedData.length);*/
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.myFun = function ()
        {
            window.print();
        };

    }]);

    var _dockingStation_clean_fromDate;
    var _dockingStation_clean_toDate;
    var _dockingStation_clean_location;
    app.controller('AddDockingStationCleanManage', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {

        $scope.DockingStationCleanReportInputs=
            {
            fromdate:'',
            todate:'',
                location:'',
        };

      /*  $scope.DockingStationClean = [];*/

        $scope.sendCleanInputsDetails = function () {
            DataService.sendDockingStationCleanInputsDetails($scope.DockingStationCleanReportInputs).then(function (response) {
                if (!response.error) {
                    _dockingStation_clean_fromDate = $scope.DockingStationCleanReportInputs.fromdate;
                    _dockingStation_clean_toDate = $scope.DockingStationCleanReportInputs.todate;
                    _dockingStation_clean_location = $scope.DockingStationCleanReportInputs.location;
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
        }

        $scope.DockingStations = [];

        DataService.getDockingStations().then(function (response) {
                if (!response.error) {

                    $scope.DockingStations = response.data;

                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedDockingStation = function (data) {
            $scope.DockingStationCleanReportInputs.location = data.name;
        };

        $scope.printDockingStationCleaningReport = function () {
            $state.go('admin.maintenance.dockingstationcleaning-report-print');
        };

        /*$scope.DockingStationClean = [];

        DataService.getDockingStationCleaningDetails().then(function (response) {
            if (!response.error)
            {
                $scope.DockingStationClean = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.dockingStationCleanTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.DockingStationClean, params.filter()) : $scope.DockingStationClean;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

        $scope.addDockingStationClean = function () {
            $state.go('admin.maintenance.add');
        };*/
    }]);


    app.controller('AddDockingStationClean', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
       /* alert(_login_id);*/

        $scope.dockingStationCleanInput={
            stationId:'',
            cleaneddate:'',
            fromtime:'',
            totime:'',
            empId:'',
            description:'',
            createdBy:_login_id,
        };

        $scope.addDockingStationClean = function () {
            DataService.saveDockingStationCleaning($scope.dockingStationCleanInput).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                   /* $state.go('admin.registration-centres.edit', {'id': response.data._id});*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.dockingStationSelections = [];

        DataService.getDockingStations().then(function (response) {
                if (!response.error) {

                    $scope.dockingStationSelections = response.data;
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedDockingStation = function (data) {
            $scope.dockingStationCleanInput.stationId = data._id;
        };

        $scope.employeeSelections = [];

        DataService.getStaffs().then(function (response) {
                if (!response.error) {

                    $scope.employeeSelections = response.data;
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedEmployee = function (data) {
            $scope.dockingStationCleanInput.empId = data.id;
        };

        $scope.cancelAddDockingStationCleaning = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.maintenance.manage-view');
            });
        };


        $scope.dockingStationCleanReport = function () {
            $state.go('admin.maintenance.dockingstationcleaning-report');
        };

    }]);

    app.controller('AddDockingStationCleanReport', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.dockingStationCleaningInputs={
            cleanFromDate:'',
            cleanToDate:'',
            dockingStation:''
        };

        $scope.sendDockingStationCleaningDetails = function () {
            DataService.getDockingStationCleaningDetails($scope.dockingStationCleaningInputs).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.dockingStationSelections = [];

        DataService.getDockingStations().then(function (response) {
                if (!response.error) {
                    $scope.dockingStationSelections = response.data;
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedDockingStation = function (data) {
            $scope.dockingStationCleaningInputs.dockingStation = data.name;
        };

            $scope.dockingStationCleaningReportPrint = function () {
            $state.go('admin.maintenance.dockingstationcleaning-report-print');
        };
    }]);

    app.controller('AddDockingStationCleanReportPrint', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        alert(_dockingStation_clean_fromDate);
        $scope.cleanInputsDetails={
            from_date:_dockingStation_clean_fromDate,
            to_date:_dockingStation_clean_toDate,
            location:_dockingStation_clean_location
        }

        $scope.print = function ()
        {
            window.print();
        };
    }]);


var _station_name;
var _station_id;
    app.controller('DockingStationStationNewDesign', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.dockingStations = [];

        DataService.getDockingStations().then(function (response) {
                if (!response.error)
                {
                    $scope.dockingStations = response.data;
                   /* _No_of_DockingStations =  $scope.dockingStations.length;*/
                    for(var i=0;i<response.data.length;i++)
                    {
                       /* _station_name = response.data[i].name;
                        _station_id= response.data[i]._id;*/
                    }
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.change='the data';
        $scope.changenew='the data';
        $scope.getVal=function(event){
            console.log($scope.change);
            console.log(event.currentTarget.value);
           /* $scope.change=event.currentTarget.value;*/
            _station_id=event.currentTarget.value;
            _station_name = event.currentTarget.name;
            $scope.AddDockingStationCleanDetails();
        }


        $scope.AddDockingStationCleanDetails = function (size) {
            $uibModal.open({
                templateUrl: 'docking-station-clean.html',
                controller: 'DockingStationStationNewDesign1',
                size: size,
                resolve: {
                    items: function () {
                    }
                }
            });
        };
    }]);

    app.controller('DockingStationStationNewDesign1', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal','$uibModalInstance', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal,$uibModalInstance)
    {
       /* alert(_station_name);
        alert(_station_id);*/

        $scope.dockingStationCleanInput={
            stationId:_station_name,
            stationIdnew:_station_id,
            cleaneddate:'',
            fromtime:'',
            totime:'',
            empId:'',
            description:'',
            createdBy:_login_id,
        };

        $scope.addDockingStationClean = function () {
            DataService.saveDockingStationCleaning($scope.dockingStationCleanInput).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    /* $state.go('admin.registration-centres.edit', {'id': response.data._id});*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.employeeSelections = [];

        DataService.getStaffs().then(function (response) {
                if (!response.error) {

                    $scope.employeeSelections = response.data;
                }
                else {
                    growl.error(response.message)
                }
            },
            function(response)
            {
                growl.error(response.data);
            });

        $scope.selectedEmployee = function (data) {
            $scope.dockingStationCleanInput.empId = data.id;
        };


        $scope.cancelAddNewDocknckingStationClean = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Bicycle Maintenance Manage
    app.controller('BicycleMaintenanceManage', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {

    }]);

    // bicycle Maintenance Report
    app.controller('BicycleMaintenanceReport', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.bicyleMaintenanceInputs={
          from_date:'',
            to_date:''
        };

        $scope.sendBicyleMaintenanceInputs = function () {
            DataService.sendBicycleMaintenanceDetails($scope.bicyleMaintenanceInputs).then(function (response)
            {
                if (!response.error) {
                    growl.success(response.message);
                } else
                    {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.printBicycleMaintenanceReport = function () {
            $state.go('admin.maintenance.bicycle-maintenance.report-print');
        }
    }]);

    app.controller('BicycleMaintenanceReportPrint', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window, $uibModal)
    {
        $scope.print = function ()
        {
            window.print();
        };

    }]);

    /*app.controller('BaskCashDeposits', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {

    }]);*/

    // Manage Members Controller
    app.controller('ManageBankCashDeposits', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {

        $scope.bankcashdepositsDetails = [];

        /*fetching registration center table details*/
        DataService.getBankCashDepositDetails().then(function (response) {
            if (!response.error) {
                $scope.bankcashdepositsDetails = response.data;
                $scope.bankcashdepositsDetails.forEach(function (bankCashDeposit)
                {
                    bankCashDeposit.status = StatusService.getRegistrationCentresStatus(bankCashDeposit.status);
                    bankCashDeposit.longitude = bankCashDeposit.gpsCoordinates.longitude;
                    bankCashDeposit.latitude = bankCashDeposit.gpsCoordinates.latitude;
                });
                $scope.bankCashDepositTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.bankCashDepositTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.bankcashdepositsDetails, params.filter()) : $scope.bankcashdepositsDetails;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );


        $scope.addNewRegistrationCentre = function () {
            $state.go('admin.registration-centres.add');
        };


        $scope.addNewBankCashDetails = function () {
            $state.go('admin.accounts.bankcashdeposits.add');
        };
    }]);

    app.controller('AddBankCashDeposits', ['$scope', '$state', 'DataService', 'growl', 'sweet', function ($scope, $state, DataService, growl, sweet)
    {
        $scope.bankCashDeposit=[];

      /*  var test = cashCollectionDate;*/

        $scope.bankCashDeposit =
        {
            cashCollectionDate:'',
            depositDate:'',
           /* regCentreName:'',*/
            amount:'',
            bankName:'',
            branch:'',
            transactionId:'',
            depositedBy:'',
            remarks:'',
            location:'',
            createdBy:_login_id
        };


        $scope.addNewBankCashDetails = function () {
            DataService.saveBankCashDepositDetails($scope.bankCashDeposit).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                   /* $state.go('admin.registration-centres.edit', {'id': response.data._id});*/
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.cancelAddBankCashDeposits = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.accounts.bankcashdeposits.manage');
            });
        };


        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.bankCashDeposit.location = data.location;
        };

    }]);

    var _bankcashdeposit_fromdate;
    var _bankcashdeposit_todate;
    var _bankcashdeposit_location;
    var BankcashDeposit=[];
    app.controller('BankCashDepositReport', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', 'StatusService', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, $uibModal, StatusService)
    {

        /*$scope.bankCashDepositReport =
        {
            fromdate:'',
            todate:''
        };*/

        $scope.bankDepositsInput=
        {
            fromdate:'',
            todate:'',
            location:''
        };

        $scope.bankDeposits =[];

       /* $scope.BankcashDeposit=[];*/

        $scope.sendBankCaskDetails = function () {
            DataService.SendBankCashDepositDetails($scope.bankDepositsInput).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);

                    _bankcashdeposit_fromdate =$scope.bankDepositsInput.fromdate;
                    _bankcashdeposit_todate =$scope.bankDepositsInput.todate;
                    _bankcashdeposit_location = $scope.bankDepositsInput.location;

                    $scope.bankDeposits = response.data;

                    BankcashDeposit = response.data;

                    $scope.bankDepositsTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.bankDeposits, params.filter()) : $scope.bankDeposits;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }
                        }
                    );

                }else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

        $scope.MyFunction = function ()
        {
            window.print();
        };

        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenters = function (data) {
            $scope.bankDepositsInput.location = data.location;
        };

    }]);



    app.controller('registrationDetails', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        /*$scope.registrationDetails=[];*/

        $scope.registrationDetails = {
            FromDateRegDetails: '',
            ToDateRegDetails: '',
            RegCenters: ''
        };

        $scope.RegistrationCenters=[];

        DataService.getRegistrationCentres().then(function (response)
            {
                if (!response.error)
                {
                    $scope.RegistrationCenters = response.data;
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.selectedRegistrationCenter = function (data) {
            $scope.registrationDetails.RegCenters = data.location;
        };

        $scope.sendDetails = function () {
            DataService.SendRegistrationDetails($scope.registrationDetails).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

    }]);



    // Smart Card Status Controller
    app.controller('TransactionDetails', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'transactionId', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, transactionId) {

        $scope.transactionId = transactionId;

        DataService.getMemberTransaction($scope.transactionId).then(function (response) {
            if (!response.error) {
                $scope.transaction = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.closeTransactionDetails = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    // Close Transaction Controller
    app.controller('CloseTransaction', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$uibModalInstance', 'transactionId', function ($scope, $state, DataService, growl, sweet, $uibModalInstance, transactionId) {

        $scope.transactionData = {
            checkInDate: '',
            checkInTime: new Date(),
            hstep: 1,
            mstep: 1,
            ismeridian: '12H'
        };

        $scope.postTransaction = function () {
            var data = {
                checkInDate: $scope.transactionData.checkInDate,
                checkInTime: $scope.transactionData.checkInTime,
                cycleRFID: transactionId.bicycle.cycleRFID
            };
            console.log(data);
            DataService.postCloseTransaction(data).then(function (response) {
                if (!response.error) {
                    $uibModalInstance.dismiss();
                    growl.success(response.message);
                    $state.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });
        };

        $scope.closePostTransaction = function () {
            $uibModalInstance.dismiss();
        };

    }]);


    app.controller('SimulateCheckout', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter) {
        $scope.members = [];
        $scope.dockingStations = [];
        $scope.dockingUnits = [];
        $scope.dockingPorts = [];
        var bicycles = [];

        $scope.transaction = {
            member: '',
            cycleRFID: '',
            fromPort: '',
            cardNumber: '',
            checkOutTime: ''
        };

        DataService.getMembers().then(function (response) {
            if (!response.error) {
                $scope.members = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStations = response.data;
            }
            else {
                growl.error(response.message);
            }
        });

        $scope.selectStationName = function (data) {
            $scope.dockingUnitIds = [];

            for (var i = 0; i < data.dockingUnitIds.length; i++) {
                $scope.dockingUnitIds.push(data.dockingUnitIds[i].dockingUnitId);
            }

            var filters = {
                filter: {where: {_id: {$in: $scope.dockingUnitIds}}}
            };

            DataService.getDockingUnits(filters).then(function (response) {
                if (!response.error) {
                    $scope.dockingUnits = response.data;
                }
            });
        };

        $scope.selectUnit = function (data) {
            $scope.dockingPortIds = [];

            for (var i = 0; i < data.dockingPortIds.length; i++) {
                $scope.dockingPortIds.push(data.dockingPortIds[i].dockingPortId);
            }

            var filters = {
                filter: {where: {_id: {$in: $scope.dockingPortIds}}}
            };

            DataService.getDockingPorts(filters).then(function (response) {
                if (!response.error) {
                    $scope.dockingPorts = response.data;

                    DataService.getBicycles().then(function (response) {
                        if (!response.error) {
                            bicycles = response.data;
                        } else {
                            growl.error(response.message);
                        }
                    }, function (response) {
                        growl.error(response.data.description['0']);
                    });
                }
            });
        };

        $scope.selectPort = function () {
            var bicycleRFID = '';
            $scope.dockingPorts.forEach(function (dockingPort) {
                if (dockingPort._id === $scope.transaction.fromPort) {
                    bicycleRFID = dockingPort.cycleRFID;
                }
            });
            bicycles.forEach(function (bicycle) {
                if (bicycle.cycleRFID === bicycleRFID) {
                    $scope.transaction.cycleRFID = bicycle.cycleRFID;
                }
            });
        };

        $scope.checkout = function () {
            $scope.members.forEach(function (member) {
                if (member._id === $scope.transaction.member) {
                    $scope.transaction.cardNumber = member.smartCardNumber;
                }
            });
            $scope.transaction.checkOutTime = new Date().toISOString();

            console.log($scope.transaction);
            DataService.saveMemberTransaction($scope.transaction).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            })
        };

    }]);

    app.controller('SimulateCheckin', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter) {
        $scope.memberTransactions = [];
        $scope.bicycles = [];
        $scope.dockingStations = [];
        $scope.dockingUnits = [];
        $scope.dockingPorts = [];
        var bicycles = [];
        var filters = {
            filter: {
                populate: {path: 'member'}
            }
        };

        $scope.transaction = {
            memberTransactionId: '',
            cycleRFID: '',
            toPort: '',
            cardNumber: '',
            checkInTime: ''
        };

        DataService.getAllMemberTransactions(filters).then(function (response) {
            if (!response.error) {
                $scope.memberTransactions = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStations = response.data;
            }
            else {
                growl.error(response.message);
            }
        });

        $scope.selectTransaction = function () {
            $scope.memberTransactions.forEach(function (memberTransaction) {
                if (memberTransaction._id === $scope.transaction.memberTransactionId) {
                    $scope.transaction.cardNumber = memberTransaction.member.smartCardNumber;
                    $scope.transaction.cycleRFID = memberTransaction.bicycle.cycleRFID;
                }
            });
        };

        $scope.selectStationName = function (data) {
            $scope.dockingUnitIds = [];

            for (var i = 0; i < data.dockingUnitIds.length; i++) {
                $scope.dockingUnitIds.push(data.dockingUnitIds[i].dockingUnitId);
            }

            var filters = {
                filter: {where: {_id: {$in: $scope.dockingUnitIds}}}
            };

            DataService.getDockingUnits(filters).then(function (response) {
                if (!response.error) {
                    $scope.dockingUnits = response.data;
                }
            });
        };

        $scope.selectUnit = function (data) {
            $scope.dockingPortIds = [];

            for (var i = 0; i < data.dockingPortIds.length; i++) {
                $scope.dockingPortIds.push(data.dockingPortIds[i].dockingPortId);
            }

            var filters = {
                filter: {where: {_id: {$in: $scope.dockingPortIds}}}
            };

            DataService.getDockingPorts(filters).then(function (response) {
                if (!response.error) {
                    $scope.dockingPorts = response.data;

                    DataService.getBicycles().then(function (response) {
                        if (!response.error) {
                            bicycles = response.data;
                        } else {
                            growl.error(response.message);
                        }
                    }, function (response) {
                        growl.error(response.data.description['0']);
                    });
                }
            });
        };

        $scope.selectPort = function () {
            var bicycleRFID = '';
            $scope.dockingPorts.forEach(function (dockingPort) {
                if (dockingPort._id === $scope.transaction.toPort) {
                    bicycleRFID = dockingPort.cycleRFID;
                }
            });
        };

        $scope.checkin = function () {
            $scope.transaction.checkInTime = new Date().toISOString();

            console.log($scope.transaction);
            DataService.updateMemberTransaction($scope.transaction).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
        };

    }]);


// Edit Member Controller
    app.controller('EditProfile', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', '$filter', 'AWS', 'loggedInUser', '$uibModal', function ($scope, $state, $stateParams, DataService, growl, sweet, $filter, AWS, loggedInUser, $uibModal) {
        $scope.employee = {};

        $scope.addNewDocument = function () {
            $scope.employee.documents.push({});
        };

        $scope.changePassword = function () {
            return $uibModal.open({
                templateUrl: 'changePassword-modal.html',
                controller: 'ChangePassword',
                size: 'md',
                resolve: {
                    employee: function () {
                        return $scope.employee;
                    }
                }
            });
        };

        var userId = loggedInUser.assignedUser;

        DataService.getEmployee(userId).then(function (response) {
            if (!response.error) {
                $scope.employee = response.data;
                var phone = $scope.employee.phoneNumber;
                var splitArr = phone.split("-");
                $scope.employee.countryCode = splitArr[0];
                $scope.employee.phoneNumber = phone.split('-').slice(1).join('-');

                if ($scope.employee.emergencyContact.contactNumber) {
                    var contactPhone = $scope.employee.emergencyContact.contactNumber;
                    var contactSplit = contactPhone.split("-");
                    $scope.employee.emergencyContact.countryCode = contactSplit[0];
                    $scope.employee.emergencyContact.contactNumber = contactPhone.split('-').slice(1).join('-');
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }
                if (!$scope.employee.picture || $scope.employee.picture == '') {
                    $scope.profilePicUrl = 'assets/images/no-avatar.png'
                } else {
                    $scope.profilePicUrl = AWS + 'Employee/' + response.data.employeeId + '/' + response.data.picture + '.png';
                }
                $scope.employee.documents.forEach(function (document) {
                    document.documentProof = AWS + 'Employee/' + $scope.employee.employeeId + '/' + document.documentCopy + '.png';
                });
                $scope.employee.joiningDate = new Date($scope.employee.joiningDate);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.removeProfilePic = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record in the future',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                closeOnConfirm: true
            }, function () {
                $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
                if ($scope.employee.emergencyContact.contactNumber) {
                    $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
                } else {
                    $scope.employee.emergencyContact.contactNumber = "";
                }
                $scope.employee.picture = '';
                DataService.updateEmployee($scope.employee).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                        $state.reload();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description['0']);
                });
            });
        };

        $scope.updateEmployee = function () {
            $scope.employee.phoneNumber = $scope.employee.countryCode + '-' + $scope.employee.phoneNumber;
            if ($scope.employee.emergencyContact.contactNumber) {
                $scope.employee.emergencyContact.contactNumber = $scope.employee.emergencyContact.countryCode + '-' + $scope.employee.emergencyContact.contactNumber;
            } else {
                $scope.employee.emergencyContact.contactNumber = "";
            }
            DataService.updateEmployee($scope.employee).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    window.location.reload();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.message);
            })
        };

    }]);

    app.controller('ChangePassword', ['$scope', '$state', 'DataService', 'growl', 'sweet', '$stateParams', '$uibModalInstance', 'loggedInUser', function ($scope, $state, DataService, growl, sweet, $stateParams, $uibModalInstance, loggedInUser) {

        $scope.stations = [];

        $scope.employee = {
            currentPassword: '',
            newPassword: '',
            _id: loggedInUser._id
        };

        $scope.changePassword = function () {
            DataService.saveChangePassword($scope.employee).then(function (response) {
                if (!response.error) {
                    growl.success(response.message);
                    $uibModalInstance.dismiss();
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            })
        };

        $scope.cancelChangePassword = function () {
            $uibModalInstance.dismiss();
        };

    }]);

    app.controller('BicycleAvailability', ['$scope','$interval', 'DataService', 'growl', 'StatusService', 'NgTableParams', '$filter', 'sweet', 'loggedInUser', '$state', 'GOOGLEMAPURL', function ($scope,$interval, DataService, growl, StatusService, NgTableParams, $filter, sweet, loggedInUser, $state, GOOGLEMAPURL)
    {
        var multiDockingStations = [];

    //    $scope.view = 0;
        $scope.dockingStationsData = [];

            DataService.getDockingStations().then(function (response) {

                if (!response.error) {
                    $scope.dockingStationsData = response.data;
                    $scope.dockingStations = response.data;
                    for (var i = 0; i < $scope.dockingStations.length; i++) {
                        var longAndLat = {
                            longitude: $scope.dockingStations[i].gpsCoordinates.longitude,
                            latitude: $scope.dockingStations[i].gpsCoordinates.latitude,
                            mapUrl: GOOGLEMAPURL,
                            show: false,
                            title: $scope.dockingStations[i].name,
                            bicycleCount: $scope.dockingStations[i].bicycleCount,
                            bicycleCapacity: $scope.dockingStations[i].bicycleCapacity,
                            dockingStationStatus: StatusService.getDockingStationStatus($scope.dockingStations[i].status),
                            id: i
                        };
                        multiDockingStations.push(longAndLat);
                    }

                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });


        $scope.map = {
            center: {
                latitude: 12.3024314,
                longitude: 76.6615633
            }, zoom: 13
        };

        $scope.options = {scrollwheel: false};
        $scope.markers = multiDockingStations;

        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function (marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.closeClick = function () {
            $scope.windowOptions.visible = false;
        };

        $scope.swapView = function (viewType) {
            $scope.view = viewType;
        };

        $scope.initiateSync = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Initiating a sync is a performance-intensive operation. Use this sparingly!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, initiate sync!',
                closeOnConfirm: true
            }, function () {
                var data = {
                    employeeId: loggedInUser.assignedUser
                };
                DataService.initiateSync(data).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

    }]);

    app.controller('PortStatus', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal) {
        var multiDockingStations = [];

        $scope.view = 0;
        $scope.dockingStationsData = [];

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStationsData = response.data;
                $scope.dockingStations = response.data;
                for (var i = 0; i < $scope.dockingStations.length; i++) {
                    var longAndLat = {
                        longitude: $scope.dockingStations[i].gpsCoordinates.longitude,
                        latitude: $scope.dockingStations[i].gpsCoordinates.latitude,
                        mapUrl: GOOGLEMAPURL,
                        show: false,
                        title: $scope.dockingStations[i].name,
                        bicycleCount: $scope.dockingStations[i].bicycleCount,
                        bicycleCapacity: $scope.dockingStations[i].bicycleCapacity,
                        dockingStationStatus: StatusService.getDockingStationStatus($scope.dockingStations[i].status),
                        id: i
                    };
                    multiDockingStations.push(longAndLat);
                }

            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.map = {
            center: {
                latitude: 12.3024314,
                longitude: 76.6615633
            }, zoom: 12
        };

        $scope.options = {scrollwheel: false};
        $scope.markers = multiDockingStations;

        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function (marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.closeClick = function () {
            $scope.windowOptions.visible = false;
        };

        $scope.swapView = function (viewType) {
            $scope.view = viewType;
        };

        $scope.initiateSync = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'Initiating a sync is a performance-intensive operation. Use this sparingly!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, initiate sync!',
                closeOnConfirm: true
            }, function () {
                var data = {
                    employeeId: loggedInUser.assignedUser
                };
                DataService.initiateSync(data).then(function (response) {
                    if (!response.error) {
                        growl.success(response.message);
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
            });
        };

        $scope.stations = [];

        $scope.test1 =[];

        $scope.dockingStationDetails =[];

        DataService.getBicycleAvailability().then(function (response) {
            if (!response.error) {
                // if (response.data.requests) {
                if (!response.error) {
                    $scope.stations = response.data;
                    /* $scope.test1= $filter('orderBy')($scope.stations.portIds,'dockingPortId.FPGA');*/
                    $scope.stations.forEach(function (requests) {
                        requests.status = StatusService.getDockingStationStatus(requests.stationStatus);
                    });
                    var lastModifiedAt = new Date(response.data.lastModifiedAt);
                    $scope.stations.lastModifiedAt = lastModifiedAt.getDate() + '-' + lastModifiedAt.getMonth() + '-' + lastModifiedAt.getFullYear();
                    $scope.stations.forEach(function (station) {
                        station.portIds.forEach(function (dockingPortId) {
                            /*if (dockingPortId.dockingPortId.portStatus == 0) {
                             dockingPortId.tooltipMessage = dockingPortId.vehicleRFID;
                             }*/
                            if (dockingPortId.dockingPortId.portStatus == 1) {
                                var _data= { };
                                _data=dockingPortId.dockingPortId.vehicleId;

                                dockingPortId.tooltipMessage = _data[0].vehicleid.vehicleNumber;
                            }

                            if (dockingPortId.dockingPortId.portStatus== 2) {
                                dockingPortId.tooltipMessage = "Empty";
                            }

                            /* if(dockingPortId.dockingPortId.FPGA == 3 || dockingPortId.dockingPortId.FPGA == 4)
                             {
                             dockingPortId.tooltipMessage = "FPGA";
                             }*/
                            /* if (dockingPortId.dockingPortId.portStatus == 3) {
                             dockingPortId.tooltipMessage = "Port Locked";
                             }

                             if (dockingPortId.dockingPortId.portStatus == 4) {
                             dockingPortId.tooltipMessage = "Non Operational";
                             }*/
                        })
                    });
                    $scope.dockingStationsTable.reload();
                }
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            /*growl.error(response.data.description);*/
        });
        $scope.loadPorts = function () {
         $state.reload();
         };
        $scope.dockingStationsTable = new NgTableParams(
            {
                count: 50
            },
            {
                getData: function ($defer, params) {
                    params.total($scope.stations.length);
                    $defer.resolve($scope.stations.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );
    }]);

    app.controller('BicycleLifeCycle', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal) {
        $scope.bicycleLifeCycle = [];

        var filters = {
            filter: {
                populate: {path: 'bicycleId'}
            }
        };

        DataService.getBicycleLifeCycle(filters).then(function (response) {
            if (!response.error) {
                $scope.bicycleLifeCycle = response.data;
                $scope.bicycleLifeCycleTable.reload();
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.message);
        });

        $scope.loadBicycleLifeCycle = function () {
            $state.reload();
        };

        $scope.bicycleLifeCycleTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    params.total($scope.bicycleLifeCycle.length);
                    $defer.resolve($scope.bicycleLifeCycle.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }
        );

    }]);

    app.controller('RedistributionVehicleTracking',  ['$scope','$interval', 'DataService', 'growl', 'StatusService', 'NgTableParams', '$filter', 'sweet', 'loggedInUser', '$state', 'GOOGLEMAPURL', function ($scope,$interval, DataService, growl, StatusService, NgTableParams, $filter, sweet, loggedInUser, $state, GOOGLEMAPURL)
    {
        // Docking Stations tracking
      /*  var multiDockingStations = [];

        $scope.dockingStationsData = [];

        DataService.getDockingStations().then(function (response) {
            if (!response.error) {
                $scope.dockingStationsData = response.data;
                $scope.dockingStations = response.data;
                for (var i = 0; i < $scope.dockingStations.length; i++) {
                    var longAndLat = {
                        longitude: $scope.dockingStations[i].gpsCoordinates.longitude,
                        latitude: $scope.dockingStations[i].gpsCoordinates.latitude,
                        mapUrl: GOOGLEMAPURL,
                        show: false,
                        title: $scope.dockingStations[i].name,
                        bicycleCount: $scope.dockingStations[i].bicycleCount,
                        bicycleCapacity: $scope.dockingStations[i].bicycleCapacity,
                        dockingStationStatus: StatusService.getDockingStationStatus($scope.dockingStations[i].status),
                        id: i
                    };
                    multiDockingStations.push(longAndLat);
                }

            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        $scope.map = {
            center: {
                latitude: 12.3024314,
                longitude: 76.6615633
            }, zoom: 13
        };

        $scope.options = {scrollwheel: false};
        $scope.markers = multiDockingStations;

        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function (marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.closeClick = function () {
            $scope.windowOptions.visible = false;
        };

        $scope.swapView = function (viewType) {
            $scope.view = viewType;
        };*/

        // Redistribution vehicle tracking



        var multiRedistributionVehicle = [];


        $scope.redistributionVehicleData = [];
$interval(function () {


            DataService.getRedistributionVehicles().then(function (response) {
                if (!response.error) {
                    $scope.redistributionVehicleData = response.data;
                    $scope.redistributionVehicles = response.data;
                    for (var i = 0; i < $scope.redistributionVehicles.length; i++) {
                        var longAndLat = {
                            longitude: $scope.redistributionVehicles[i].gpsCoordinates.longitude,
                            latitude: $scope.redistributionVehicles[i].gpsCoordinates.latitude,
                            mapUrl: GOOGLEMAPURL,
                            show: false,
                            /* icon:'http://www.mytrintrin.com/wp-content/uploads/2016/07/logo-final1.png',*/
                            icon: 'assets/images/redistributionVehicle.png',
                            title: $scope.redistributionVehicles[i].Name,
                            bicycleCount: $scope.redistributionVehicles[i].vehicleId.length,
                            bicycleCapacity: $scope.redistributionVehicles[i].portCapacity,
                            dockingStationStatus: StatusService.getRedistributionVehicleStatus($scope.redistributionVehicles[i].portStatus),
                            id: i
                        };
                        multiRedistributionVehicle.push(longAndLat);
                    }
                }
                else
                {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description);
            });

},10000);

            $scope.map = {
                center: {
                    latitude: 12.3024314,
                    longitude: 76.6615633
                }, zoom: 13
            };

            $scope.options = {scrollwheel: false};
            $scope.markers = multiRedistributionVehicle;

            $scope.windowOptions = {
                visible: false
            };

            $scope.onClick = function (marker, eventName, model) {
                model.show = !model.show;
            };

            $scope.closeClick = function () {
                $scope.windowOptions.visible = false;
            };

            $scope.swapView = function (viewType) {
                $scope.view = viewType;
            };
    }])

    app.controller('headerCtrl',  ['$timeout','messageService', function ($timeout,messageService) {
        // Top Search
        this.openSearch = function () {
            angular.element('#header').addClass('search-toggled');
            angular.element('#top-search-wrap').find('input').focus();
        }

        this.closeSearch = function () {
            angular.element('#header').removeClass('search-toggled');
        }
    }])

}());


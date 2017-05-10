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
    var _user_name;
    var _user_balance;
    var _validity;
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
    /*app.controller('AdminController', ['$scope', '$state', 'auth', 'growl','sweet','$filter','StatusService', 'DataService','NgTableParams','AWS',  function ($scope, $state, auth, growl,sweet,$filter,StatusService,DataService,NgTableParams,AWS){*/
        app.controller('AdminController',['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {
        $scope.$on('sideBar', function (event, data) {
            $scope.sideBar = data;
        })

        $scope.LogInUID=localStorage.ID;

       /* var aaa=  sessionStorage.getItem("emp-key");*/

        // User Details
        DataService.getUserDetails($scope.LogInUID).then(function (response) {
            if (!response.error) {
                $scope._user_name=response.data.Name;

                $scope._user_balance=response.data.creditBalance;
                $scope._validity=response.data.validity;
                $scope.membershipid=response.data.membershipId;
                _user_balance=response.data.creditBalance;
                _validity=response.data.validity;
                $scope.user_status=response.data.status;
                growl.success(response.data.message);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        DataService.getLastTransaction($scope.LogInUID).then(function (response) {
            if (!response.error) {
                $scope.creditAmount=response.data.credit;
                $scope.creditDate=response.data.paymentdate;
                $scope.status=response.data.order_status;
             /*   growl.success(response.data.message);*/
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

        // getting rides of the member
        $scope.SingleRide=[];
        DataService.getRidesUser($scope.LogInUID).then(function (response) {
            if (!response.error) {
                    $scope.SingleRide.push(response.data[0]);
            }
            else
            {
                growl.error(response.message);
            }
        }, function (response) {
           /* growl.error(response.data.description['0']);*/
        });

        $scope.SingleRideTable = new NgTableParams(
            {
                count: 10
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.SingleRide, params.filter()) : $scope.SingleRide;
                 /*   params.total(orderedData.length);*/
                   /* $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                }
            }
        );
    }]);
    //403 Controller
    app.controller('403Controller', ['$scope', '$state', 'auth', 'growl', function ($scope, $state, auth, growl) {

    }]);

    //Login Controller
    app.controller('LoginController', ['$state', '$scope', '$rootScope', '$timeout', 'growl', 'user', 'auth', 'DataService','md5', function ($state, $scope, $rootScope, $timeout, growl, user, auth, DataService,md5) {
        $scope.login = true;

        $scope.reg = function () {
            $scope.login = false;
            $scope.forget = false;
            $scope.signup = false;
        };
        $scope.for = function () {
            $scope.login = false;
            $scope.forget = true;


            $scope.forgot = function (email) {
                var data = {
                    email: email
                };
                if(data.email == "" || data.email == null)
                {
                    growl.error("Please enter the email");
                }
                else {
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
                }
            };
        };

        $scope.demo = function () {
            $scope.login = false;
            $scope.forget = false;
            $scope.signup = true;

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
            $scope.signup=false;
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

            $scope.UID=res.data.data.uid;
            localStorage.ID=$scope.UID;

          /*  alert(_login_id);*/
            if (token) {
                auth.saveToken(token);
                $state.reload();
                DataService.getUserDetails($scope.UID).then(function (response) {
                    if (!response.error) {
                        $scope.MemberName=response.data.Name;
                        localStorage.UserName = $scope.MemberName;
                        $scope.user_status=response.data.status;
                        /*growl.success(response.message);*/
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                });
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
                password = md5.createHash(password || '');
            user.login(username, password)
                .then(handleRequest, handleRequest);
            $state.reload();
            }
        };



        $scope.changepassword=function () {

            $scope.passValidation=false;
           // $scope.signupDetails.cpassword = '';
            if ($scope.signupDetails.password.length >= 6)
            {
                //if password contains both lower and uppercase characters, increase strength value
                if ($scope.signupDetails.password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                {
                    //if it has numbers and characters, increase strength value
                    if ($scope.signupDetails.password.match(/([0-9])/))
                    {
                        //if it has one special character, increase strength value
                        if ($scope.signupDetails.password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                        {
                            $scope.passValidation=true;
                        }
                    }
                }
            }
        };

        $scope.signupDetails={
            Name:'',
            lastName:'',
            email:'',
            phoneNumber:'',
            password:'',
            cpassword:''
        };

        $scope.UserSignup = function ()
        {
                /*var _pass = md5.createHash($scope.signupDetails.password || '')*/
            if( $scope.signupDetails.Name == "" || $scope.signupDetails.Name == null)
            {
                growl.error("Please enter username");
            }
            else if( $scope.signupDetails.phoneNumber == "" || $scope.signupDetails.phoneNumber == null)
            {
                growl.error("Please enter mobile number");
            }
            else if( $scope.signupDetails.email == "" || $scope.signupDetails.email == null)
            {
                growl.error("Please enter email");
            }
            else if( $scope.signupDetails.password == "" || $scope.signupDetails.password == null)
            {
                growl.error("Please enter password");
            }
            else if( $scope.signupDetails.cpassword == "" || $scope.signupDetails.cpassword == null)
            {
                growl.error("Please enter confirm password");
            }
            else if($scope.signupDetails.password!== $scope.signupDetails.cpassword)
            {
                growl.error("Password Mismatch");
            }

            else if(!$scope.passValidation)
            {
                growl.error("Your password does not meet the policy requirements");
            }
            else
                {
                    var _first_name =  $scope.signupDetails.Name;
                    var _last_name =  $scope.signupDetails.lastName;
                    var _email =  $scope.signupDetails.email;
                    var _phoneno = "91-" + $scope.signupDetails.phoneNumber;
                   var _password = md5.createHash($scope.signupDetails.password || '');
                    var _cpassword = md5.createHash($scope.signupDetails.cpassword || '');
                   /* var _password = $scope.signupDetails.password;
                   var _cpassword = $scope.signupDetails.cpassword;*/
                    $scope.signupDetailsHash={
                        Name:_first_name,
                        lastName:_last_name,
                        email:_email,
                        phoneNumber:_phoneno,
                        password:_password,
                        cpassword:_cpassword
                    };
                DataService.signup($scope.signupDetailsHash).then(function (response) {
                    if (!response.error) {

                        growl.success('Sign Up Successful');

                        $scope.log();
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })
            }
        };

    }]);

    // reset password success controller
    app.controller('resetPasswordSuccess', ['$state', '$scope', '$rootScope', '$timeout', 'growl', 'user', 'auth', 'DataService','md5', function ($state, $scope, $rootScope, $timeout, growl, user, auth, DataService,md5)
    {
        $scope.backToLogin=function () {
            $state.go('login');
        }
    }]);

    app.controller('ViewTickets', ['$scope', '$state', 'DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter','$window', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter,$window)
    {
            $scope.loginId=localStorage.ID;
            var _loginID=$scope.loginId;

        /*$scope.GetTickets=function (created,assign,status)
        {*/
            /*if(created == 'LoginId') {
                created = _loginID;
            }*/
            var created=_loginID;
            var assign="All";
            var status="Open";
            var _dept_admin="All";
            var _ticket_type_admin="All";
            var _to_date_admin=new Date();
            var _from_date_admin = new Date();
            _from_date_admin.setDate(_from_date_admin.getDate() - 15);

            $scope.ticketsCreatedAll={
                createdBy:created,
                assignedEmp:assign,
                status:status,
                todate:_to_date_admin,
                fromdate:_from_date_admin,
                department:_dept_admin,
                tickettype:_ticket_type_admin,
            };

            DataService.getRaisedTickets($scope.ticketsCreatedAll).then(function (response) {
                if (!response.error) {
                    $scope.RaisedTickets = [];
                    $scope.RaisedTickets = response.data;
                    $scope.GeneralTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.RaisedTickets, params.filter()) : $scope.RaisedTickets;
                                /* params.total(orderedData.length);
                                 $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                            }
                        }
                    );
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
       /* }*/
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

    var cc_member_name;
    var cc_member_uid;
    var cc_member_email;
    var cc_member_mobile;
    var plan_name="";
    var security_deposit=0;
    var smart_card_fee=0;
    var useage_fees=0;
    var total_fees =0;
    app.controller('SelectPlans', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'NgTableParams', '$filter', '$uibModal', 'StatusService', function ($scope, $state, $stateParams, DataService, growl, sweet, NgTableParams, $filter, $uibModal, StatusService)
    {
        $scope.LogInUID=localStorage.ID;
        var User_ID=$scope.LogInUID;

        $scope.membershipData = [];

        var filters = {
            filter: {
                populate: {path: 'farePlan'}
            }
        };

        DataService.getMemberships(filters).then(function (response) {
            if (!response.error) {
                $scope.membershipData = response.data;
                $scope.orderid = new Date().getTime();
                $scope.tid = new Date().getTime();
                $scope.uid=User_ID;
                $scope.membershipData.forEach(function (membership) {
                });
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

        DataService.getUserDetails(User_ID).then(function (response) {
            if (!response.error) {
                cc_member_name=response.data.Name;
                $scope.UserName = response.data.Name;
                /*cc_member_uid=response.data.UserID;*/
                cc_member_uid=User_ID;
                cc_member_email = response.data.email;
                $scope.UserEmail =  response.data.email;
                cc_member_mobile = response.data.phoneNumber;
                $scope.UserMobile = response.data.phoneNumber;
                growl.success(response.data.message);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });

            $scope.Selectplan = function (event) {
                var _plan_obj_id = event.currentTarget.value;
                DataService.getPlanDetails(_plan_obj_id).then(function (response) {
                    if (!response.error) {
                         plan_name = response.data.subscriptionType;
                         security_deposit =response.data.securityDeposit;
                         smart_card_fee = response.data.smartCardFees;
                         useage_fees= response.data.userFees;
                         total_fees = security_deposit + smart_card_fee + useage_fees;
                         orderid:new Date().getTime(),
                        /*$state.go('admin.ccavenurequest.manage');*/
                        $scope.sendPlanDetails={
                            _member_name:cc_member_name,
                            _member_uid:cc_member_uid,
                            _member_email:cc_member_email,
                            _member_no:cc_member_mobile,
                            _selected_plan:plan_name,
                            _plan_amount:total_fees
                        };
                        DataService.sendforCCavenu($scope.sendPlanDetails).then(function(response){
                            if (!response.error) {
                                growl.success(response.message);
                            } else {
                                growl.error(response.message);
                            }
                        }, function (response) {
                            growl.error(response.data.description);
                        })

                        growl.success(response.message);
                    } else {
                        growl.error(response.message);
                    }
                }, function (response) {
                    growl.error(response.data.description);
                })

            };

    }]);

    app.controller('RideHistory', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {

      /*  $scope.user_id = _user_id;*/
       /* $scope.user_id = _login_id;*/

        $scope.LogInUID=localStorage.ID;

        $scope.ridesDataUser = [];

        DataService.getRidesUser($scope.LogInUID).then(function (response) {
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
            growl.error(response.data.description);
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
        /*$scope.user_id = _user_id;*/
        $scope.LogInUID=localStorage.ID;

        $scope.userPaymentHistory = [];

        DataService.getUserPayment($scope.LogInUID).then(function (response) {
            if (!response.error) {
                var i=0;
                /* $scope.ridesDataUser= response.data;*/
                for(i=0;i<response.data.length;i++)
                {
                    var _payments = response.data[i];
                    $scope.userPaymentHistory.push(_payments);
                }
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
    app.controller('PasswordChange', ['$scope', '$state', 'sweet', 'DataService', 'growl', '$uibModal','md5', function ($scope, $state, sweet, DataService, growl, $uibModal,md5)
    {

        $scope.LogInUID=localStorage.ID;
        var User_ID=$scope.LogInUID;

        $scope.passValidation=false;
        $scope.changepassword=function () {
            $scope.passValidation=false;

            var strength = 0;
            if ($scope.password.length >= 6)
            {
                //if password contains both lower and uppercase characters, increase strength value
                if ($scope.password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                {
                    //if it has numbers and characters, increase strength value
                    if ($scope.password.match(/([0-9])/))
                    {
                        //if it has one special character, increase strength value
                        if ($scope.password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                        {
                            $scope.passValidation=true;
                        }
                    }
                }
            }
        };

        $scope.submit = function (oldPassword,newPassword,confirmPassword)
        {

            if($scope.passValidation)
            {
                if($scope.password == $scope.cpassword)
                {
                    oldPassword = md5.createHash(oldPassword || '');
                    newPassword = md5.createHash(newPassword || '');
                    confirmPassword = md5.createHash(confirmPassword || '');
                    $scope.passwords = {
                        currentPassword: oldPassword,
                        newPassword: newPassword,
                        cpassword:confirmPassword,
                        uid: User_ID
                    };
                    DataService.saveNewPassword($scope.passwords).then(function (response) {
                        if (!response.error) {

                            oldPassword = "";
                            newPassword = "";
                            confirmPassword = "";
                            $scope.cpassword = "";
                            $scope.password = "";
                            $scope.oldPassword = "";
                            growl.success("Password Reset Successfull");
                            $state.go('admin');
                        } else {
                            growl.error("old password does not match");
                        }
                    }, function (response) {
                        growl.error("old password does not match");
                    });
                }
                else
                {
                    growl.error("Password does not match");
                }
            }
            else {
                growl.error("Your password does not meet the policy requirements");
            }

        };


    }]);

    //Feedback
    app.controller('UserFeedBack', ['$scope', '$state', 'sweet', 'DataService', 'growl', function ($scope, $state, sweet, DataService, growl)
    {
        $scope.LogInUID=localStorage.ID;
        var User_ID=$scope.LogInUID;

        var _subject = "UserFeedBack";

        $scope.FeedbackDetails={
        name:_user_name,
        createdBy:User_ID,
            ticketdate:new Date(),
            subject:_subject,
            channel:5,
            priority:2,
            description:''
        };

        $scope.userfeedback = function () {
            DataService.saveUserFeedback($scope.FeedbackDetails).then(function (response)
            {
                if (!response.error) {
                    growl.success("Feedback submitted successfully");
                    $scope.FeedbackDetails.description = "";
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
            });
        };
    }]);

    app.controller('CCavenu', ['$scope', '$state', 'sweet', 'DataService', 'growl', function ($scope, $state, sweet, DataService, growl)
    {
            $scope.memberDetails={
                 name:cc_member_name,
                 uid:cc_member_uid,
                 email:cc_member_email,
                 mobile:cc_member_mobile,
                 planName:plan_name,
                 totalFees:total_fees,
                 tid:new Date().getTime(),
            }

            $scope.testhidden={
                name:''
            };

    }]);

    app.controller('UserHomePage', ['$scope', '$state', 'sweet', 'DataService', 'growl', function ($scope, $state, sweet, DataService, growl)
    {
        $scope.userDetails={
            name:_user_name,
           expirydate:_validity,
            balance:_user_balance
        };
    }]);

    app.controller('TopUp', ['$scope', '$state', 'DataService', 'NgTableParams', 'growl', 'sweet', '$filter', 'StatusService', '$uibModal', 'AWS', function ($scope, $state, DataService, NgTableParams, growl, sweet, $filter, StatusService, $uibModal, AWS)
    {
        $scope.LogInUID=localStorage.ID;
        $scope.UID=$scope.LogInUID;
        $scope.orderid=new Date().getTime();
        $scope.tid=new Date().getTime();

        DataService.getUserDetails($scope.LogInUID).then(function (response) {
            if (!response.error) {
                $scope._user_name=response.data.Name;
                $scope._user_balance=response.data.creditBalance;
                $scope._validity=response.data.validity;
                $scope.membershipid=response.data.membershipId;
                _user_balance=response.data.creditBalance;
                _validity=response.data.validity;
                $scope.user_status=response.data.status;
                growl.success(response.data.message);
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description);
        });


        $scope.TopupData = [];

        DataService.getTopups().then(function (response) {
            if (!response.error) {
                $scope.TopupData = response.data;
            } else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.topupTable = new NgTableParams(
            {
                count: 6
            },
            {
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.TopupData, params.filter()) : $scope.TopupData;
                    /*   params.total(orderedData.length);
                     $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                }
            }
        );
    }]);

    /*Tickets (Raise tickets)*/
    var _ticket_number;
    app.controller('RaiseTickets', ['$scope', '$state', 'DataService', 'growl', 'sweet','$uibModal', function ($scope, $state, DataService, growl, sweet,$uibModal)
    {
        $scope.LogInUID=localStorage.ID;
        $scope.LoginUserName=localStorage.UserName;
        
        $scope.TicketsDetails={
            name:$scope.LoginUserName,
            createdBy:$scope.LogInUID,
            ticketdate:new Date(),
            subject:'',
            channel:5,
            description:'',
            priority:3,
            user:$scope.LogInUID
        };
        
        $scope.addTicketsDetails=function () {
            DataService.saveTicketsDetails($scope.TicketsDetails).then(function (response)
                {
                    if (!response.error)
                    {
                        _ticket_number = response.data.uuId;
                        /*growl.success(response.message);*/
                        $uibModal.open({
                            templateUrl: 'TicketNumber.html',
                            controller: 'TicketNo',
                            resolve: {
                                items: function () {
                                }
                            }
                        });
                    } else
                    {
                        growl.error(response.message);
                    }
                },
                function (response) {
                    growl.error(response.message);
                });
        }
    }]);

    app.controller('TicketNo', ['$scope', '$state', '$stateParams', 'DataService', 'growl', 'sweet', 'AWS', '$uibModalInstance', 'loggedInUser', function ($scope, $state, $stateParams, DataService, growl, sweet, AWS, $uibModalInstance, loggedInUser)
    {

        $scope.TicketNumber = _ticket_number;

        $scope.ok = function () {
            $uibModalInstance.dismiss();
        };
    }]);

    app.controller('MyTickets', ['$scope', '$state','DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        $scope.LogInUID=localStorage.ID;

        $scope.MyTickets;

       var open = [];
       var close = [];

        DataService.getMyTickets($scope.LogInUID).then(function (response)
            {
                if (!response.error)
                {
                    for(var i=0;i<response.data.length;i++)
                    {
                        if(response.data[i].status == 'Open')
                        {
                            open.push(response.data[i]);
                            if(i==response.data.length-1)
                            {
                                $scope.MyTickets = open;
                            }
                        }
                        if(response.data[i].status == 'Close')
                        {
                            close.push(response.data[i]);
                        }

                    }

                    $scope.MyTicketsTable = new NgTableParams(
                        {
                            count: 10
                        },
                        {
                            getData: function ($defer, params) {
                                var orderedData = params.filter() ? $filter('filter')($scope.MyTickets, params.filter()) : $scope.MyTickets;
                                /*params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                            }
                        }
                    );
                } else
                {
                    growl.error(response.message);
                }
            },
            function (response) {
                growl.error(response.message);
            });

        $scope.ticketsDetailsReply = function (id) {
            $state.go('admin.tickets.my-tickets.details-and-reply', {'id': id});
        };

        $scope.OpenTickets=function () {
            $scope.MyTickets=open;

            $scope.MyTicketsTable = new NgTableParams(
                {
                    count: 10
                },
                {
                    getData: function ($defer, params) {
                        var orderedData = params.filter() ? $filter('filter')($scope.MyTickets, params.filter()) : $scope.MyTickets;
                        /*params.total(orderedData.length);
                         $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                    }
                }
            );
        }
        $scope.ClosedTickets=function ()
        {
            $scope.MyTickets=close;

            $scope.MyTicketsTable = new NgTableParams(
                {
                    count: 10
                },
                {
                    getData: function ($defer, params) {
                        var orderedData = params.filter() ? $filter('filter')($scope.MyTickets, params.filter()) : $scope.MyTickets;
                        /*params.total(orderedData.length);
                         $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));*/
                    }
                }
            );
        }
    }]);

    var _ticket_id;
    app.controller('TicketsDetailsReply', ['$scope', '$state','$stateParams','DataService', 'StatusService', 'NgTableParams', 'growl', 'sweet', '$filter', '$uibModal', function ($scope, $state,$stateParams, DataService, StatusService, NgTableParams, growl, sweet, $filter, $uibModal)
    {
        $scope.LogInUID=localStorage.ID;

        _ticket_id = $stateParams.id;

        $scope.RaisedTicket = {};
        $scope.ReplyDescriptions=[];
        $scope.ReplyFromanddates=[];

        DataService.getMyTicketDetails($stateParams.id).then(function (response) {
            if (!response.error)
            {
                $scope.RaisedTicket = response.data[0];

                for(var i =0;i<response.data[0].transactions.length;i++)
                {
                    $scope.ReplyDescriptions.push(response.data[0].transactions[i]);
                    $scope.ReplyFromanddates.push(response.data[0].transactions[i].replierId)
                }
            }
            else {
                growl.error(response.message);
            }
        }, function (response) {
            growl.error(response.data.description['0']);
        });

        $scope.cancelTicketDetails = function () {
            sweet.show({
                title: 'Are you sure?',
                text: 'You may have unsaved data',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, leave!',
                closeOnConfirm: true
            }, function () {
                $state.go('admin.tickets.my-tickets.add');
            });
        };

        $scope.replyDetails={
            ticketid:_ticket_id,
            replydate:new Date(),
            description:'',
            replierId:$scope.LogInUID,
            status:''
        };

        if($scope.replyDetails.status == '')
        {
            var _ticketstatus="Open";

            $scope.replyDetails={
                ticketid:_ticket_id,
                replydate:new Date(),
                description:'',
                replierId:$scope.LogInUID,
                status:_ticketstatus
            };
        }
        else
        {
            $scope.replyDetails={
                ticketid:_ticket_id,
                replydate:new Date(),
                description:'',
                replierId:$scope.LogInUID,
                status:''
            };
        }

        $scope.addReply=function () {
            DataService.saveTicketReply($scope.replyDetails).then(function (response) {
                if (!response.error) {
                    growl.success("Successfully Replied");
                } else {
                    growl.error(response.message);
                }
            }, function (response) {
                growl.error(response.data.description['0']);
            });
        }

    }]);

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


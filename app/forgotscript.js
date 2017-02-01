var app=angular.module('myApp',[]);
app.controller("test",function ($scope) {
    $scope.passValidation=false;
    $scope.changepassword=function () {
        var regexp=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9:@#$%^&*]{8,12}$/;
        if(regexp.test($scope.password)==false)
        {
            $scope.passValidation=false;
        }
        else {
            $scope.passValidation=true;
        }
    };
});
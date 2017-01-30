// =========================================================================
// PBS Admin Controllers
// =========================================================================

(function () {
    'use strict';

    var app = angular.module('pbs');

    // =========================================================================
    // SUBMENU TOGGLE
    // =========================================================================

    app.directive('toggleSubmenu', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
            }
        }
    });


    // =========================================================================
    // STOP PROPAGATION
    // =========================================================================

    app.directive('stopPropagate', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                element.on('click', function (event) {
                    event.stopPropagation();
                });
            }
        }
    });

    app.directive('aPrevent', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                element.on('click', function (event) {
                    event.preventDefault();
                });
            }
        }
    });

    app.directive('fgLine', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if ($('.fg-line')[0]) {
                    $('body').on('focus', '.form-control', function () {
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    });

                    $('body').on('blur', '.form-control', function () {
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length == 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }

            }
        }
    });

    //Mask for input
    app.directive('inputMask', function () {
        return {
            restrict: 'A',
            scope: {
                inputMask: '='
            },
            link: function (scope, element) {
                element.mask(scope.inputMask.mask);
            }
        }
    });

    // File upload
    app.directive('file', function () {
        return {
            scope: {
                file: '='
            },
            link: function (scope, el, attrs) {
                el.bind('change', function (event) {
                    var file = event.target.files[0];
                    scope.file = file ? file : undefined;
                    scope.$apply();
                });
            }
        };
    });

    // To validate the file
    app.directive('validFile', function () {
        return {
            require: 'ngModel',
            link: function (scope, el, attrs, ngModel) {
                ngModel.$render = function () {
                    ngModel.$setViewValue(el.val());
                };

                el.bind('change', function () {
                    scope.$apply(function () {
                        ngModel.$render();
                    });
                });
            }
        };
    });

    // For .btn classes
    app.directive('btn', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if (element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                    Waves.attach(element, ['waves-circle']);
                }

                else if (element.hasClass('btn-light')) {
                    Waves.attach(element, ['waves-light']);
                }

                else {
                    Waves.attach(element);
                }

                Waves.init();
            }
        }
    });

    app.directive('ng-enter', []).directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    app.directive('myCurrentTime', ['$interval', 'dateFilter',
        function($interval, dateFilter) {
            // return the directive link function. (compile function not needed)
            return function(scope, element, attrs) {
                var format,  // date format
                    stopTime; // so that we can cancel the time updates

                // used to update the UI
                function updateTime() {
                    element.text(dateFilter(new Date(), format));
                }

                // watch the expression, and update the UI on change.
                scope.$watch(attrs.myCurrentTime, function(value) {
                    format = value;
                    updateTime();
                });

                stopTime = $interval(updateTime, 1000);

                // listen on DOM destroy (removal) event, and cancel the next UI update
                // to prevent updating time after the DOM element was removed.
                element.on('$destroy', function() {
                    $interval.cancel(stopTime);
                });
            }
        }])

    app.directive('chars', function() {

        'use strict';
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function($scope, $elem, attrs, ctrl)
            {
                var regReplace,
                    preset = {
                        'only-numbers': '0-9. ',
                        'numbers': '0-9 \\s',
                        'only-letters': 'A-Za-z0-9. ',
                        'letters': 'A-Za-z0-9.-#,' ,
                        'email': '\\wÑñ@._\\-',
                        'alpha-numeric': '\\w\\s',
                        'latin-alpha-numeric': '\\w\\sÑñáéíóúüÁÉÍÓÚÜ',
                        'none':'',
                        'number':'A-Za-z0-9.-: '
                    },
                    filter = preset[attrs.chars] || attrs.chars;

                $elem.on('input', function() {
                    regReplace = new RegExp('[^' + filter + ']', 'ig');
                    ctrl.$setViewValue($elem.val().replace(regReplace, ''));
                    ctrl.$render();
                });
            }
        };
    })

    app.directive("matchPassword", function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=matchPassword"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.matchPassword = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    });

}());
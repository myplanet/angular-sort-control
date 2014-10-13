(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module', 'angular' ], function (module, angular) {
            module.exports = factory(angular);
        });
    } else {
        if (!root.mp) {
            root.mp = {};
        }

        root.mp.datePicker = factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

    return angular.module('mp.sortControl', [])
        .directive('sortControl', [ '$window', function ($window) {
            // Introduce custom elements for IE8
            $window.document.createElement('sort-control');

            return {
                restrict: 'AE',
                link: function ($scope, $element, $attributes) {
                    $scope.$on('sortControl.sortRequest', function (evt, sortKey, sortDir) {
                        $scope.$broadcast('sortControl.sortPending', sortKey, sortDir);

                        $scope.$eval($attributes.onSort, { sortKey: sortKey, sortDir: sortDir }).then(function () {
                            $scope.$broadcast('sortControl.sortDone', sortKey, sortDir);
                        });
                    });
                }
            };
        }])
        .directive('sortKey', function () {
            return {
                restrict: 'A',
                template: '<th><span ng-transclude></span><button type="button" class="sort-control-button">Sort</button></th>',
                replace: true,
                transclude: true,
                link: function ($scope, $element, $attributes) {
                    var sortKey = $attributes.sortKey,
                        sortDir = null;

                    $element.on('click', function (evt) {
                        if (evt.target.className === 'sort-control-button') {
                            $scope.$emit('sortControl.sortRequest', sortKey, sortDir ? -sortDir : 1);
                        }
                    });

                    $scope.$on('sortControl.sortPending', function (evt) {
                        $element.find('button').attr('disabled', 'true'); // @todo: '' doesn't work for some reason
                    });

                    $scope.$on('sortControl.sortDone', function (evt, _sortKey, _sortDir) {
                        $element.find('button').removeAttr('disabled');

                        if (sortKey === _sortKey) {
                            sortDir = _sortDir;
                            $element.removeAttr(sortDir === 1 ? 'sort-desc' : 'sort-asc');
                            $element.attr(sortDir === 1 ? 'sort-asc' : 'sort-desc', '');
                        } else {
                            $element.removeAttr('sort-asc');
                            $element.removeAttr('sort-desc');
                            sortDir = null;
                        }
                    });
                }
            };
        });
}));

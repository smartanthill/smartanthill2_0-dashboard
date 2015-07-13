/**
  Copyright (C) 2015 OLogN Technologies AG

  This source file is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License version 2
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along
  with this program; if not, write to the Free Software Foundation, Inc.,
  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

(function() {
  'use strict';

  angular
    .module('siteApp')
    .controller('ConsoleController', ConsoleController);

  function ConsoleController($scope, $interval, $filter, ngTableParams, notifyUser, dataService, siteConfig) {
    var vm = this;
    vm.updateInterval = 10;  // seconds
    vm.groupBy = 'level';
    vm.showAdvancedSettings = false;

    vm.tableParams = new ngTableParams({ // jshint ignore:line
      page: 1,
      count: 10,
      sorting: {
        date: 'desc'
      }
    }, {
      getData: function($defer, params) {
        var data;
        dataService.consoleMessages().query().$promise
          .then(
            function(result) {
              data = params.sorting() ?
                $filter('orderBy')(result, params.orderBy()) : result;
              data = params.filter() ?
                $filter('filter')(data, params.filter()) : data;
              params.total(data.length);
              $defer.resolve(data.slice((params.page() - 1) * params.count(),
                params.page() * params.count()));
            },
            function(result, status) {
              notifyUser('error',
                'Error occurred during requesting console messages!'
              );
            }
          );
      },
      groupBy: function(item) {
        return item[vm.groupBy];
      },
    });

    var updater;
    $scope.$watch('vm.updateInterval', function(value) {
      attemptToCancelUpdater();
      if (value !== 'Disabled') {
        updater = $interval(function() {
          vm.tableParams.reload();
        }, value * 1000);
      }
    });

    $scope.$on('$routeChangeStart', function() {
      attemptToCancelUpdater();
    });

    $scope.$watch('vm.groupBy', function(value) {
      vm.tableParams.reload();
    });

    function attemptToCancelUpdater() {
      if (angular.isDefined(updater)) {
        $interval.cancel(updater);
        updater = undefined;
      }
    }
  }
})();

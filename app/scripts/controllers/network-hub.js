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
  /* global URI */

  angular
    .module('siteApp')
    .controller('NetworkHubController', NetworkHubController);

  function NetworkHubController($window, $log, $scope, $modalInstance,
    notifyUser, initialState, serialPortsList, transportsList) {

    var vm = this;

    vm.serialports = serialPortsList;
    vm.hub = initialState;
    vm.serialInputType = 'manual';

    angular.forEach(transportsList, function(transport) {
      if ('serial' === transport.id) {
        angular.forEach(transport.options, function(option) {
          if ('baudrate' === option.name) {
            vm.baudrateOptions = [];
            angular.forEach(option._values, function(valueObj) {
              vm.baudrateOptions.push(valueObj.value);
            });
            vm.baudrate = option.default;
          }
        });
      }
    });
    if (angular.isUndefined(vm.baudrateOptions)) {
      notifyUser('error', 'Baudrate options for serial transport not fould!');
    }

    $scope.$watch('vm.selectedSerialPort', function (newValue) {
      if (angular.isUndefined(newValue)) {
        return;
      }
      vm.serialPort = newValue.port;
    });

    if (vm.hub.connection) {
      var connection = new URI(vm.hub.connection);
      vm.baudrate = parseInt(connection.query(true)['baudrate']) || 9600;
      vm.protocol = connection.protocol() || 'serial';
      vm.serialPort = connection.pathname();
      angular.forEach(vm.serialports, function(serialPort) {
        if (vm.serialPort === serialPort.port) {
          vm.selectedSerialPort = serialPort;
          vm.serialInputType = 'serial';
        }
      });
    }

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function save() {
      if (!vm.serialPort) {
        $window.alert('You must specify port either by selecting one from' +
          'Serial Port dropdown, or by typing it manually!');
        return -1;
      }
      var uri = new URI({protocol: vm.protocol, path: vm.serialPort})
        .addQuery('baudrate', vm.baudrate);
      vm.hub.connection = uri.toString();
      $modalInstance.close(vm.hub);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

  }

})();

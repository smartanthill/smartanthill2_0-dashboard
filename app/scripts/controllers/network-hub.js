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

  function NetworkHubController($modalInstance, initialState, serialPortsList,
    transportsList) {

    var vm = this;

    vm.serialports = serialPortsList;
    vm.hub = initialState;

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
      throw new Error('Baudrate options for serial transport not fould');
    }

    if (vm.hub.connection) {
      var connection = new URI(vm.hub.connection);
      vm.baudrate = parseInt(connection.query(true)['baudrate']);
      var currentSerialPort = connection.pathname();
      switch (vm.hub.serialInputType) {
        case 'serial':
          angular.forEach(vm.serialports, function(serialPort) {
            if (currentSerialPort === serialPort.port) {
              vm.serialPort = serialPort;
            }
          });
          break;

        case 'manual':
          vm.manualPort = currentSerialPort;
          break;

        default:
          throw new Error('Unsupported port input type');
      }
    }

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function save() {
      var uriConfig = {
        protocol: 'serial',
      };
      switch (vm.hub.serialInputType) {
        case 'serial':
          uriConfig.path = vm.serialPort.port;
          break;

        case 'manual':
          uriConfig.path = vm.manualPort;
          break;

        default:
          throw new Error('Unsupported port input type');
      }
      var uri = new URI(uriConfig)
        .addQuery('baudrate', vm.baudrate);
      vm.hub.connection = uri.toString();
      $modalInstance.close(vm.hub);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

  }

})();

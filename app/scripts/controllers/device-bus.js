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
    .controller('DeviceBusController', DeviceBusController);

  function DeviceBusController($window, $log, $scope, $filter, $modalInstance,
    notifyUser, extractNumberFromName, initialState, deviceInfo, editMode,
    serialPortsList, transportsList, wizardMode) {

    var vm = this;

    vm.device = deviceInfo;
    vm.serialports = serialPortsList;
    vm.transports = transportsList;
    vm.bus = initialState;
    vm.busOptions = {};
    vm.serialInputType = 'serial';
    vm.watchCancelers = {};
    vm.wizardMode = wizardMode;
    vm.editMode = editMode;

    $scope.$watch('vm.transport', function (newValue) {
      // A place to register/deregister transport-specific watches.
      if (angular.isUndefined(newValue)) {
        return;
      }

      vm.bus.transportId = newValue.id;

      // Assign default bus name
      if (vm.wizardMode || !editMode || !vm.bus.name) {
        vm.bus.name = newValue.id;
        var existingNumber,
            busNumber = 1,
            protocol;
        angular.forEach(vm.device.buses, function(bus) {
          protocol = new URI(bus.connection).protocol();
          if (protocol === newValue.id) {
            existingNumber = extractNumberFromName(bus.name);
            if (busNumber <= existingNumber) {
              busNumber = existingNumber + 1;
            }
          }
        });
        vm.bus.name += '_' + busNumber;
      }

      if ('serial' === newValue.id) {
        if (angular.isUndefined(vm.watchCancelers.serialSelect)) {
          vm.watchCancelers.serialSelect =
            $scope.$watch('vm.selectedSerialPort', onSelectedSerialPortChanged);
        }
      } else {
        if (!angular.isUndefined(vm.watchCancelers.serialSelect)) {
          vm.watchCancelers.serialSelect();
        }
      }
    });

    vm.transport = getTransportById('serial');

    // Assigning default option values
    angular.forEach(vm.transport.options, function(option) {
      vm.busOptions[option.name] = getOptionValue(option);
    });

    if (vm.bus.connection) {
      var connection = new URI(vm.bus.connection);
      vm.transport = getTransportById(connection.protocol() || 'serial');
      vm.serialInputType = 'manual';
      vm.path = connection.pathname();
      angular.forEach(vm.serialports, function(serialPort) {
        if (vm.path === serialPort.port) {
          vm.selectedSerialPort = serialPort;
          vm.serialInputType = 'serial';
        }
      });

      // Populating transport options
      var query = connection.query(true),
          optionValue;
      angular.forEach(vm.transport.options, function(option) {
        vm.busOptions[option.name] = getOptionValue(option, query[option.name]);
      });
    }

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function save() {
      if (!vm.path) {
        $window.alert('You must specify port either by selecting one from' +
          'Serial Port dropdown, or by typing it manually!');
        return -1;
      }
      var uri = new URI({protocol: vm.transport.id, path: vm.path});
      angular.forEach(vm.transport.options, function(spec) {
        uri.addQuery(spec.name, spec._values ?
          vm.busOptions[spec.name].value : vm.busOptions[spec.name]);
      });

      vm.bus.connection = uri.toString();
      $modalInstance.close(vm.bus);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function onSelectedSerialPortChanged(newValue) {
      if (angular.isUndefined(newValue)) {
        return;
      }
      vm.path = newValue.port;
    }

    function getTransportById(id) {
      for (var i = 0; i < vm.transports.length; i++) {
        if (vm.transports[i].id === id) {
          return vm.transports[i];
        }
      }
    }

    function getOptionValue(optionSpec, currentValue) {
      optionValue = currentValue || optionSpec.default;
      if ('number' === $filter('optionTypeToInputType')(optionSpec.type)) {
        optionValue = parseInt(optionValue);
      }
      if (optionSpec._values) {
        angular.forEach(optionSpec._values, function(valueObj) {
          if (valueObj.value === optionValue) {
            optionValue = valueObj;
          }
        });
      }
      return optionValue;
    }

  }

})();

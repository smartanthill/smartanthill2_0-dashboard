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

  function DeviceBusController($log, $scope, $modalInstance, dataService,
    notifyUser, extractNumberFromName, getBoardPins, getOptionValue,
    initialState, deviceInfo, editMode, serialPortsList, transportsList,
    wizardMode, boardInfo) {

    var vm = this;

    vm.device = deviceInfo;
    vm.serialports = serialPortsList;
    vm.transports = transportsList;
    vm.boardPins = getBoardPins(boardInfo);
    vm.bus = initialState;
    vm.busOptions = {};
    vm.serialInputType = 'serial';
    vm.wizardMode = wizardMode;
    vm.editMode = editMode;

    vm.willBeConnectedDirectlyToCore = false;

    $scope.$watch('vm.transport', function (newValue) {
      if (angular.isUndefined(newValue)) {
        return;
      }

      vm.bus.transportId = newValue.id;

      // Assign default bus name
      if (vm.wizardMode || !editMode || !vm.bus.name) {
        vm.bus.name = newValue.id;
        var existingNumber,
            busNumber = 1;
        angular.forEach(vm.device.buses, function(bus) {
          if (vm.bus.transportId === newValue.id) {
            existingNumber = extractNumberFromName(bus.name);
            if (busNumber <= existingNumber) {
              busNumber = existingNumber + 1;
            }
          }
        });
        vm.bus.name += '_' + busNumber;
      }
    });

    $scope.$watch('vm.selectedSerialPort', function (newValue) {
      if (angular.isUndefined(newValue)) {
        return;
      }
      vm.serialPort = newValue.port;
    });

    vm.transport = getTransportById('serial');

    // Assigning default option values
    angular.forEach(vm.transport.options, function(option) {
      vm.busOptions[option.name] = getOptionValue(
        option, vm.bus.options[option.name]);
    });

    // handlers
    vm.save = save;
    vm.cancel = cancel;
    vm.hubMayBeAdded = hubMayBeAdded;

    ////////////

    function save() {
      angular.forEach(vm.transport.options, function(spec) {
        vm.bus.options[spec.name] = spec._values ?
          vm.busOptions[spec.name].value : vm.busOptions[spec.name];
      });

      // Add hub
      if (vm.willBeConnectedDirectlyToCore && vm.hubMayBeAdded()) {
        var hubConnection = new URI({protocol: 'serial', path: vm.serialPort})
          .addQuery('baudrate', vm.bus.options['baudrate'])
          .toString();
        dataService.hubs().get().$promise
          .then(function(hubsList) {
            var hubIsUnique = true;
            angular.forEach(hubsList.items, function(hub) {
              hubIsUnique = hubIsUnique && hubConnection !== hub.connection;
            });
            if (hubIsUnique) {
              hubsList.items.push({
                'connection': hubConnection,
                'enabled': true,
              });
              return hubsList.$save()
                .then(function() {
                  notifyUser('success', 'Hub for ' + vm.bus.name +
                   ' bus has been successfully added.');
                  closeModalWindow();
                }, function(data) {
                  notifyUser('error', ('An unexpected error occurred when ' +
                    'updating hubs list (' + data.data + ')'));
                });
            } else {
              notifyUser('warning', 'Hub with same connection attribute is ' +
                'already exists.');
            }
          });

      } else {
        closeModalWindow();
      }

      function closeModalWindow() {
        $modalInstance.close(vm.bus);
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function getTransportById(id) {
      for (var i = 0; i < vm.transports.length; i++) {
        if (vm.transports[i].id === id) {
          return vm.transports[i];
        }
      }
    }

    function hubMayBeAdded() {
      return !vm.editMode && vm.transport.id === 'serial';
    }

  }

})();

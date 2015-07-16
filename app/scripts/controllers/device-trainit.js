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
    .controller('DeviceTrainItController', DeviceTrainItController);

  function DeviceTrainItController($q, $resource, $timeout, $modalInstance,
    dataService, deviceInfo, serialPortsList, settings) {

    var vm = this;

    vm.device = deviceInfo;
    vm.serialports = serialPortsList;

    vm.selectSerialPort = {};
    vm.progressbar = {
      value: 0,
      info: ''

    };
    vm.btnDisabled = {
      start: false,
      cancel: false
    };

    // Deferred chain
    vm.deferCancalled = false;
    vm.deferred = $q.defer();
    vm.deferred.promise.then(function() {
        vm.btnDisabled.start = true;
        vm.progressbar.value = 20;
        vm.progressbar.info = 'Building...';

        if (settings.ccurl.indexOf('http') !== -1) {
          return $resource(settings.ccurl).save(deviceInfo).$promise;
        } else {
          return dataService.deviceBuildFirmware(vm.device.id).$promise;
        }
      }, function(failure) {
        return $q.reject(failure);
      })
      .then(function(result) { // building promise
          if (vm.deferCancalled) {
            return $q.reject();
          }

          vm.btnDisabled.cancel = true;
          vm.progressbar.value = 60;
          vm.progressbar.info = 'Uploading...';

          var data = result;
          data.uploadport = vm.selectSerialPort.selected.port;
          return dataService.deviceUploadFirmware(vm.device.id, data).$promise;
        },
        function(failure) {
          var errMsg = '';
          if (!failure || angular.isString(failure)) {
            errMsg = failure;
          } else {
            errMsg = 'An unexpected error occurred when building firmware.';
            if (angular.isObject(failure) && failure.data) {
              errMsg += ' ' + failure.data;
            }
          }
          return $q.reject(errMsg);
        })
      .then(function(result) { // uploading promise
          if (vm.deferCancalled) {
            return $q.reject();
          }
          vm.progressbar.value = 100;
          vm.progressbar.info = 'Completed!';
          return result.result;
        },
        function(failure) {
          var errMsg = '';
          if (!failure || angular.isString(failure)) {
            errMsg = failure;
          } else {
            errMsg =
              'An unexpected error occurred when uploading firmware.';
            if (angular.isObject(failure) && failure.data) {
              errMsg += ' ' + failure.data;
            }
          }
          return $q.reject(errMsg);
        })
      .then(function(result) {
          $timeout(function() {
            $modalInstance.close(
              'The device has been successfully Train It!-ed. ' +
              result);
          }, 1000);
        },
        function(failure) {
          if (!failure && vm.btnDisabled.start) {
            failure = 'The "Train It!" operation has been cancelled!';
          }
          $modalInstance.dismiss(failure);
        });

    vm.start = function() {
      vm.deferred.resolve();
    };

    vm.cancel = function() {
      vm.deferred.reject();
      vm.deferCancalled = true;
    };

    vm.finish = function() {
      $modalInstance.close(
        'The device has been successfully Train It!-ed.');
    };
  }

})();

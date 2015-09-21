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
    .controller('RunDeviceBodyPartController', RunDeviceBodyPartController);

  function RunDeviceBodyPartController($scope, $modalInstance, getOptionValue,
    dataService, pluginInfo, deviceInfo, bodyPartInfo, settings) {

    var vm = this;

    vm.settings = settings;
    vm.plugin = pluginInfo;
    vm.device = deviceInfo;
    vm.bodyPart = bodyPartInfo;

    vm.requestFields = {};
    vm.responseContent = '';
    vm.runDisabled = false;

    // handlers
    vm.closeModal = closeModal;
    vm.runBodyPart = runBodyPart;

    // Populate default request field values
    angular.forEach(vm.plugin.request_fields, function(field) { // jshint ignore:line
      vm.requestFields[field.name] = getOptionValue(field);
    });

    ////////////

    function runBodyPart() {
      vm.runDisabled = true;

      var cleanRequestFields = {};
      angular.forEach(vm.plugin.request_fields, function(field) { // jshint ignore:line
        cleanRequestFields[field.name] = field._values ?
          vm.requestFields[field.name].value : vm.requestFields[field.name];
      });

      dataService.runBodyPart(
          'localhost:' + vm.settings.services.api.options.rest.port,
          vm.device.id, vm.bodyPart.name, cleanRequestFields)
        .then(function(data) {
          vm.responseContent = data;
          vm.runDisabled = false;
        });
    }

    function closeModal() {
      $modalInstance.close('close');
    }
  }

})();

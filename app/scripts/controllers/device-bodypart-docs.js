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
    .controller('ShowBodyPartDocsController', ShowBodyPartDocsController);

  function ShowBodyPartDocsController($scope, $modalInstance, dataService,
    pluginInfo, deviceInfo, bodyPartInfo, settings) {

    var vm = this;

    vm.settings = settings;
    vm.plugin = pluginInfo;
    vm.device = deviceInfo;
    vm.bodyPart = bodyPartInfo;
    vm.makeJSONRPCRequestExample = makeJSONRPCRequestExample;
    vm.makeRESTURL = makeRESTURL;

    vm.serverName = 'localhost';

    // handlers
    vm.closeModal = closeModal;

    ////////////

    function makeJSONRPCRequestExample() {
      var request = {
        'jsonrpc': '2.0',
        'method': 'EXECUTE:device.' + vm.device.id + '.' + vm.bodyPart.name,
        'id': 27
      };
      if (vm.plugin.request_fields.length) {  // jshint ignore:line
        request['params'] = {};
        angular.forEach(vm.plugin.request_fields, function(field) { // jshint ignore:line
          request['params'][field.name] = getFieldValue(field);
        });
      }
      return request;
    }

    function makeRESTURL(isJson) {
      var format = '',  params = '';
      if (typeof isJson !== 'undefined' && isJson) {
        format = '.json';
      }
      if (vm.plugin.request_fields.length) { // jshint ignore:line
        params = '?';
        angular.forEach(vm.plugin.request_fields, function(field) { // jshint ignore:line
          params += field.name + '=' + getFieldValue(field) + '&';
        });
        params = params.slice(0, -1);
      }
      return 'http://' + vm.serverName + ':' +
        vm.settings.services.api.options.rest.port + '/device/' +
        vm.device.id + '/' + vm.bodyPart.name + format + params;
    }

    function closeModal() {
      $modalInstance.close('close');
    }

    function getFieldValue(field) {
      return typeof field.default !== 'undefined' ? field.default : '***';
    }
  }

})();

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
        request['params'] = 'PARAMS EXPECTED';
      }
      return request;
    }

    function makeRESTURL(isJson) {
      var format = '';
      if (typeof isJson !== 'undefined' && isJson) {
        format = '.json';
      }
      return 'http://' + vm.serverName + ':' +
        vm.settings.services.api.options.rest.port + '/device/' +
        vm.device.id + '/' + vm.bodyPart.name + format;
    }

    function closeModal() {
      $modalInstance.close('close');
    }
  }

})();

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
    .controller('MainController', MainController);

  function MainController($scope, $location) {
    var vm = this;

    vm.isRouteActive = isRouteActive;

    $scope.$watch(function() {
      return $location.path();
    }, onPathChange);

    ////////////

    function isRouteActive(route) {
      return $location.path().lastIndexOf(route, 0) === 0;
    }

    function onPathChange(path) {
      if (path === '/') {
        path = '/dashboard';
      }
      path = path.substring(1);
      vm.currentPage = path.substring(0, 1).toUpperCase() + path.substring(
        1);
    }
  }

})();

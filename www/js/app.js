angular.module('map', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicModal, $http) {
  var options = {
    timeout: 10000,
    enableHighAccuracy: true
  };

  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function() {

      createMarker($scope.map, 'red', "Me!", latLng);

    });

    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {$scope.modal = modal;});
    $scope.openModal = function() {$scope.modal.show();};
    $scope.closeModal = function() {$scope.modal.hide();};
    $scope.$on('$destroy', function() {$scope.modal.remove();});
    $scope.$on('modal.hidden', function() {});
    $scope.$on('modal.removed', function() {});

    $scope.user = {};
    $scope.registerUser = function(user) {
      $scope.modal.hide();
      console.log("Name: " + user.userName);
      console.log("Dist: " + user.distance);
      user.loc = {
        type: "Point",
        coordinates: [] };
      user.loc.coordinates.push(latLng.lng()); //Longitude comes first
      user.loc.coordinates.push(latLng.lat());
      console.log(JSON.stringify(user));
      $http({
          method: "POST",
          url: "http://ionicboth-plaul.rhcloud.com/api/friends/register/" + user.distance,
          data: user
        }).then(function(response) {
          response.data.forEach(user => 
		  {
            createMarker($scope.map, 'green', user.userName, new google.maps.LatLng(user.loc.coordinates[1], user.loc.coordinates[0]));
          })
        })
    }

  }, function(error) {
    console.log("Could not get location");
  });


});

function createMarker(map, markerColor, infoWindowText, latLng) {
  var marker = new google.maps.Marker({
    map: map,
    icon: new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/" + markerColor + ".png"),
    animation: google.maps.Animation.DROP,
    position: latLng
  });

  var infoWindow = new google.maps.InfoWindow({
    content: infoWindowText
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.open(map, marker);
  });

  return marker;
}

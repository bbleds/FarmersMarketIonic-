angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $cordovaGeolocation, $q, $http) {

    //*********** Private Variables    
      var map;
      var lat;
      var lng;

      // Holds array of markers so that markers may be cleared
      var markerArray = [];

    //********** Controller functions
      function mapMarketsNear(apiPlacesResponse){

         //the places returned from USDA api are based on the closest places
            //markets is an array of place objects
            var markets =  apiPlacesResponse.results;
            console.log("markets ", markets);

      }



    // ********** Main Controller Functionality ***************  

      //Get current location of device using ngCordova
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
      .getCurrentPosition(posOptions)
      //the following function will :
        // 1) set the map on inital pageload, 
        // 2) create a function that, when called in the for loop, populates the map with the five closest locations. 
        // After function, if zip is entered in input, we will clear map
      .then(function (position) {

          //Holds position object
            var pos = position;
          //Current latitude of device
            lat  = position.coords.latitude;
          //Current longitude of device
            lng = position.coords.longitude;

      //** Set up initial map options
            var mapOptions = {
              center: new google.maps.LatLng(lat,lng),
              zoom: 10,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              mapTypeControl: false
            };
          //Initialize map on current lat and lng variables
            map = new google.maps.Map(document.getElementById('map'), mapOptions);

      //** Set up marker and info window 
            //Set marker on Current Lat and Lng variables
            var marker = new google.maps.Marker({
              position: {"lat": lat, "lng" : lng},
              map: map,
              title: 'ME',
              animation: google.maps.Animation.DROP
            });
          //Set up contents of info window popup that will be attached to current position marker
            var infoWindowOptions = {
              content: 'You Are Here!'
            };
          //Attach info window and content to current marker, passing in inforWindowOptions above
            var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
          //Attach event handler for click event on marker, this will open up an infor window on click with the information in infoWindowOptions
            google.maps.event.addListener(marker,'click',function(e){
              infoWindow.open(map, marker);      
            });


        //Get current address of device via lat and lng variables and the Google Maps API in order to pull out zip code so that zip code can be given to UDSA API
          $q(function(resolve, reject) {
              $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'')
              .success(
                function(addressResponse) {
                  resolve(addressResponse);

                }, function(error) {
                  reject(addressResponse);
                }
              )
          })
          //when promise is resolved
          .then(function(address){
            
            //get zip code from address object given from promise
              var zipCode = address.results[2].address_components[0].long_name;
            //query USDA farmer's market api for markets close  to current location       
              $q(function(resolve, reject) {
                $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip='+zipCode)
                  .success(
                    function(addressResponse) {
                      resolve(addressResponse);

                    }, function(error) {
                      reject(error);
                    }
                  );
              //when promise is returned
              }).then(function(places){

                mapMarketsNear(places);


              });

          })

        })//Ends 'then' after ngCordova call




    })
  

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

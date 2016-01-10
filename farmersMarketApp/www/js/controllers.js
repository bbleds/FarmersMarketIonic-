angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $cordovaGeolocation, $q, $http) {


  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {

      var pos = position;
      console.log("pos ", pos);

      //current lat of device
      var lat  = position.coords.latitude

      //current lng of device
      var lng = position.coords.longitude
      console.log("lat = ", lat);
      console.log("lng = ", lng);

        //set map options
         var mapOptions = {
          center: new google.maps.LatLng(lat,lng),
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        //initialize map on current lat and lng
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

        //add marker on current lat and lng of device
        var marker = new google.maps.Marker({
          position: {"lat": lat, "lng" : lng},
          map: map,
          title: 'ME',
          animation: google.maps.Animation.DROP
        });

        var infoWindowOptions = {
          content: 'You Are Here!'
      };

      //set an info window, passing in inforWindowOptions above
      var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

      //add click event to marker, this will open up an infor window on click with the information in infoWindowOptions
      google.maps.event.addListener(marker,'click',function(e){
        
        infoWindow.open(map, marker);
        
      });



         //get current address of device in order to pull out zip code by initiating a promise
         var getAddress = $q(function(resolve, reject) {
          $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'')
          .success(
            function(addressResponse) {
              resolve(addressResponse);

            }, function(error) {
              reject(error);
            }
          );
          //promise resolves address
        }).then(function(address){

          //get zip code from address object given from promise
          var zipCode = address.results[2].address_components[0].long_name;

          //query USDA farmer's market api for markets close         
          $q(function(resolve, reject) {
          $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip='+zipCode)
            .success(
              function(addressResponse) {
                resolve(addressResponse);

              }, function(error) {
                reject(error);
              }
            );
          }).then(function(places){

            //the places returned from USDA api are based on the closets places
            //markets is an array of place objects
            var markets =  places.results;
            console.log("markets ", markets);

            
            var closeMarketIdArray = [];
              //loop through markets object, pull out the five closest market id's, and store in an array
            for(var i=0; i < 5; i++){
              //push id of current item into closeMarketIdArray variable
              closeMarketIdArray.push(markets[i].id);
            }
            console.log("closeMarketArray ", closeMarketIdArray);

            var closeMarketObjectsArray = [];

              //loop through id's in closeMarketIdArray and store details in object
              //details needed 
                //address
                //lat
                //lng
                //products
                //days open
                for(var i = 0; i < closeMarketIdArray.length; i++){
                     $q(function(resolve, reject) {
                    $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id='+closeMarketIdArray[i])
                      .success(
                        function(addressResponse) {
                          resolve(addressResponse);

                        }, function(error) {
                          reject(error);
                        }
                      );
                    }).then(function(details){
                        console.log("details ", details);

                        //parse lat and lng from url address recived from USDA api Googlelink key
                        var parsedLat = parseFloat(details.marketdetails.GoogleLink.split("?q=")[1].split("%2C%20")[0]);
                        var parsedLng = parseFloat(details.marketdetails.GoogleLink.split("?q=")[1].split("%2C%20")[1].split("%20")[0]);                                                

                        //object to push into closeMarketObjectsArray array
                        var marketToPush = {
                          "address" : details.marketdetails.Address,
                          "products" : details.marketdetails.Products,
                          "schedule" : details.marketdetails.Schedule,
                          "lat" : parsedLat,
                          "lng" : parsedLng
                        }

                        //push into closeMarketObjectsArray 
                        closeMarketObjectsArray.push(marketToPush);

                        //add to map 
                        var marketToMap = new google.maps.Marker({
                          position: {"lat": marketToPush.lat, "lng" : marketToPush.lng},
                          map: map,
                          title: 'Hello World!',
                          animation: google.maps.Animation.DROP
                        });

                          var infoWindowOptions = {
                            content: '<h1>'+marketToPush.address+'</h1>'
                        };

                        //set an info window, passing in inforWindowOptions above
                        var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

                        //add click event to marker, this will open up an infor window on click with the information in infoWindowOptions
                        google.maps.event.addListener(marketToMap,'click',function(e){
                          
                          infoWindow.open(map, marketToMap);
                          
                        });

                    })
                }




          });



        });



    }, function(err) {
      // error
    });


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

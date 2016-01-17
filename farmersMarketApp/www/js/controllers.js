angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $cordovaGeolocation, $q, $http) {

    //*********** Private Variables
      var map;
      var lat;
      var lng;

      // Holds array of markers so that markers may be cleared
      var markerArray = [];


//********** DashCtrl General Functions ************* //

  // Gets details of a specific market based on arguments passed in
    function getMarketDetails(marketNameGiven, idGiven){

        var closeMarketObjectsArray = [];
        console.log("marketName inside >>>>>>>>>>>", marketNameGiven);
                  console.log("ID given inside >>>>>>>>>>>",idGiven);

             $q(function(resolve, reject) {
                    $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id='+idGiven)
                      .success(
                        function(addressResponse) {
                          resolve(addressResponse);

                        }, function(error) {
                          reject(error);
                        }
                      );
                    })
                    .then(function(details){
                        console.log("details ", details);
                        marketName = marketNameGiven;
                        console.log("name", marketName);

                        //parse lat and lng from url address recived from USDA api Googlelink key
                        var parsedLat = parseFloat(details.marketdetails.GoogleLink.split("?q=")[1].split("%2C%20")[0]);
                        var parsedLng = parseFloat(details.marketdetails.GoogleLink.split("?q=")[1].split("%2C%20")[1].split("%20")[0]);

                        //object to push into closeMarketObjectsArray array
                        var marketToPush = {
                          "address" : details.marketdetails.Address,
                          "products" : details.marketdetails.Products,
                          "schedule" : details.marketdetails.Schedule,
                          "lat" : parsedLat,
                          "lng" : parsedLng,
                          "marketname" : marketNameGiven
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

                        //push marker into marker array
                        markerArray.push(marketToMap);

                          var infoWindowOptions = {
                            content: '<h3>'+marketToPush.marketname+'</h3>'
                                      +'<br<<p>'+marketToPush.address+'</p>'
                                      +'<br<<p>'+marketToPush.schedule+'</p>'
                        };

                        //set an info window, passing in inforWindowOptions above
                        var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

                        //add click event to marker, this will open up an infor window on click with the information in infoWindowOptions
                        google.maps.event.addListener(marketToMap,'click',function(e){

                          infoWindow.open(map, marketToMap);

                        });

                    })

      }

    //Draws the closest markets on the map
      function mapMarketsNear(apiPlacesResponse){

        console.log("in map>>>>>>>>>>>>>>>>>>>>>>>>");

         //the places returned from USDA api are based on the closest places
            //markets is an array of place objects
            var markets =  apiPlacesResponse.results;
            console.log("markets ", markets);

            //holds the name of close markets
            var closeMarketNameArray = [];
            //holds the id of close markets
            var closeMarketIdArray = [];

            //loop through markets object, pull out the five closest market id's, and store in an array
            for(var i=0; i < 5; i++){
              //push id of current item into closeMarketIdArray variable
              closeMarketIdArray.push(markets[i].id);
              closeMarketNameArray.push(markets[i].marketname);
            }
            console.log("closeMarketArray ", closeMarketIdArray);
            console.log("closeMarketNameArray ", closeMarketNameArray);

            var closeMarketObjectsArray = [];

            //loop through id's in closeMarketIdArray and store details in object
              //details needed
                //address
                //lat
                //lng
                //products
                //days open

                //this is referenced for each marketname because the for loop moves on to the next index before the name can be refenced with the i variable

             for(var i = 0; i < closeMarketIdArray.length; i++){

                  //splits market name into an array and removes distance which is at index 0 and is included in the name
                  var marketName = closeMarketNameArray[i].split(" ").splice(1).join(" ");

                  console.log("marketName outside >>>>>>>>>>>", marketName);
                  console.log("ID given outside >>>>>>>>>>>",closeMarketIdArray[i]);

                    //this function gets the market details for each place, and accepts the name of the current market as an argument
                    getMarketDetails(marketName, closeMarketIdArray[i]);

                    console.log("closeMarketIdArray[i] ", closeMarketIdArray[i]);


                  }


      }



// ********** Main Controller Functionality ***************

  //Get current location of device using ngCordova, and map closest locations

      //get position
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
              icon : '../img/iphone2.png',
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

    // Recenters map and draws new locations when user enters zip code in input field
     $scope.zipEnter = function($event, enterZip){

      //if numbers entered are an actual zip code
                //clear map of all current markers
                //populate map with new markers

              //if numbers entered are not an actual zip code
                //notify user

      //capture which key was pressed
       var keyCode = $event.keyCode;

        //if enter key was pressed
        if(keyCode === 13){
           //clear old markers (these are stored in the markerArray variable)
              for(var i = 0; i < markerArray.length; i++){
                //for each item in array, clear from map
                markerArray[i].setMap(null);
            }

          //return promise for data received from new google maps api call
          $q(function(resolve, reject) {
              $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+enterZip+'&country=us')
              .success(
                function(addressResponse) {
                  resolve(addressResponse);

                }, function(error) {
                  reject(error);
                }
              );
            //When promise resolves the zip code request
          }).then(function(zipAddress){

            //hold latitude of new location returned from google maps API
            var lat = zipAddress.results[0].geometry.location.lat;

            //hold longitude of new location returned from google maps API
            var lng = zipAddress.results[0].geometry.location.lng;

            //holds the center of the new new location
            var newCenter = {
              "lat" : lat,
              "lng" : lng
            }

            //pan map to new location
            map.panTo(newCenter);

          });

          //repopulate markers via the new zip enterd, the mapMarketsNear function and the getMarketDetails function
            $q(function(resolve, reject) {
              $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip='+enterZip)
                .success(
                  function(addressResponse) {
                    resolve(addressResponse);

                  }, function(error) {
                    reject(error);
                  }
                );
            //when promise is returned
            }).then(function(places){

              //map and populate new markers
              mapMarketsNear(places);
            });

        }
      }
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

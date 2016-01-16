.controller('DashCtrl', function($scope, $cordovaGeolocation, $q, $http) {

  //private variables
    var map;

    // Holds array of markers so that markers may be cleared
    var markerArray = [];

  //Get current location of device
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    //the following function will set the map on inital pageload, create a function that, when called in the for loop, populates the map with the five closest locations. When zip is enetered we will clear map
    .then(function (position) {

      //holds position object
      var pos = position;

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
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false
        };

        //initialize map on current lat and lng
         map = new google.maps.Map(document.getElementById('map'), mapOptions);

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

             var closeMarketNameArray = [];
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

            var getMarketDetails = function(marketNameGiven, idGiven){
                     $q(function(resolve, reject) {
                    $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id='+idGiven)
                      .success(
                        function(addressResponse) {
                          resolve(addressResponse);

                        }, function(error) {
                          reject(error);
                        }
                      );
                    }).then(function(details){
                        console.log("details ", details);
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

                    //this function gets the market details for each place, and accepts the name of the current market as an argument
                    getMarketDetails(marketName, closeMarketIdArray[i]);

                    console.log("closeMarketIdArray[i] ", closeMarketIdArray[i]);


                  }

                  //attach event for clearing old markers, setting new markers, and panning to new zip code
                      //show five closest markets to new zip code
                      //the keypress event is passed in
                      $scope.zipEnter = function($event, enterZip){

                        //clear old markers
                          for(var i = 0; i < markerArray.length; i++){

                            //for each item in array, clear from map
                            markerArray[i].setMap(null);

                          }



                        //capture which key was pressed
                       var keyCode = $event.keyCode;

                        //if enter key was pressed
                        console.log("$scope.enterZip ", enterZip);
                        if(keyCode === 13){

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

                            //promise resolves address
                          }).then(function(zipAddress){
                            console.log("zipAddress ", zipAddress);

                            //hold latitude of new location
                            var lat = zipAddress.results[0].geometry.location.lat;

                            //hold longitude of new location
                            var lng = zipAddress.results[0].geometry.location.lng;

                            //holds the center of the new new location
                            var newCenter = {
                              "lat" : lat,
                              "lng" : lng
                            }

                            //pan map to new location
                            map.panTo(newCenter);

                          });

                              //if numbers entered are an actual zip code
                                //clear map of all current markers
                                //populate map with new markers

                                //re-population
                                  $q(function(resolve, reject) {
                                    $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip='+ enterZip)
                                      .success(
                                        function(addressResponse) {
                                          resolve(addressResponse);

                                        }, function(error) {
                                          reject(error);
                                        }
                                      );
                                    }).then(function(places){
                                      console.log("results ", places);
                                      //the places returned from USDA api are based on the closets places
                                      //markets is an array of place objects
                                      var markets =  places.results;
                                      var closeMarketNameArray = [];
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
            var getMarketDetails = function(marketNameGiven, idGiven){
                     $q(function(resolve, reject) {
                    $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id='+idGiven)
                      .success(
                        function(addressResponse) {
                          resolve(addressResponse);

                        }, function(error) {
                          reject(error);
                        }
                      );
                    }).then(function(details){
                        console.log("details ", details);
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
       for(var i = 0; i < closeMarketIdArray.length; i++){

                  //splits market name into an array and removes distance which is at index 0 and is included in the name
                  var marketName = closeMarketNameArray[i].split(" ").splice(1).join(" ");

                    //this function gets the market details for each place, and accepts the name of the current market as an argument
                    getMarketDetails(marketName, closeMarketIdArray[i]);

                    console.log("closeMarketIdArray[i] ", closeMarketIdArray[i]);


                  }





                                    })





                              //if numbers entered are not an actual zip code
                                //notify user
                        }

                      }





          });



        });



    }, function(err) {
      // error
    });





})

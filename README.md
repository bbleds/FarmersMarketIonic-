# Aril

Aril is a locator app built using the Ionic framework, Angular.js, the Google Maps API, the Factual API, and the USDA National Farmers Market Directory API. Try it out at [farmers-market-ionic.herokuapp.com](http://farmers-market-ionic.herokuapp.com/#/tab/dash).

#Purpose & Goal

This app was one of my first experiences with Ionic. My overall goal was to -
 1. Develop an app that integrated multiple APIs (one specifically being the Google Maps API)
 2. Gain a greater understanding of connecting express with front-end (namely using proxies via express to resolve CORS issues)
 3. Gain Experience working with Angular, Ionic, Node, and Express.

#Features

Aril locates and plots the five closest farmers' markets to a devices location (via latitude and longitude). After the inital mapping of locations, Aril accepts zip code input from a user and plots the new locations relative to the zip code entered. In addition, a user is able to tap/click on a plotted location, see location/market details, and receive step by step directions from the current device location to the selected market location.

#Local Use
To use this app locally/get it on your machine -
  1. Git clone onto your local machine ( via HTTPS) - ``` https://github.com/bbleds/FarmersMarketIonic-.git```
  2. Go into the new cloned directory - ``` cd FarmersMarketIonic- ```
  3. Install packages required by this app (via npm) -
    ```
    npm install
    ```
  4. Install front-end dependencies (via bower)-
  	 ```
    npm run bower install
    ```
  4. Run express server, and you're done! (after running, go to localhost:5000 in your browser to view) -
    ```
    npm start
    ```


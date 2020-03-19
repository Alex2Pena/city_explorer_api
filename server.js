'use strict';

//libraries

// my server
const express = require('express');
const app = express();

// gets the variables from our hiding place
require('dotenv').config();

// the underpaid security guard
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;
const superagent = require('superagent');


app.get('/location', (request, response) => {
  // this is the city that the front end is sending us in the qurey
  // the query lives in the url after the ? htt://cooldomain.com?city=seattle
  let city = request.query.city;
  console.log('😎', city);
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;

  superagent.get(url)
    .then(results => {
      // let geoData = results.body;
      let location = new Location(results.body[0], city);
      response.status(200).send(location);
    }).catch(err => {
      // send error to the backend
      console.error(err);

      // sends error to the front end with a status 500 - server error
      response.status(500).send(err);
    });
});

app.get('/weather', (request, response) => {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${lon}`;

  superagent.get(url)
    .then(results => {
      let wData = results.body.daily.data;

      let weather = wData.map(day => new Weather(day));

      response.status(200).send(weather);
    });
});

app.get('/trails', (request, response) => {
  let {latitude,longitude} = request.query;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;
  superagent.get(url)
    .then(results => {
      const dataObj = results.body.trails.map(trail => new Trail(trail));
      response.status(200).send(dataObj);
    });
});

app.get('*', (request, response) => {
  // 404 error no page found
  response.status(404).send('nothing to see here');
})


// Constructor Functions
function Location(obj, city){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
function Weather(obj){
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toString().slice(0,15);
}
function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0,10);
  this.condition_time = obj.conditionDate.slice(11,19);
}

app.get('*', (request, response) => {
  response.status(404).send('there is nothing on this page');
});

// turn on the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

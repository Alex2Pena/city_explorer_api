'use strict';

// requires the variables from our hiding place
require('dotenv').config();

const express = require('express');
// my server
const app = express();
//libraries



// the underpaid security guard
const cors = require('cors');
app.use(cors());

const pg = require('pg');

const PORT = process.env.PORT || 3001;
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/location', (request, response) => {
  // this is the city that the front end is sending us in the qurey
  // the query lives in the url after the ? htt://cooldomain.com?city=seattle
  let city = request.query.city;
  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];
  console.log('searched city:', city);
  client.query(sql,safeValues)
    .then(results => {
      if(results.rows.length > 0){
        console.log('found city in DB:', city);
        response.send(results.rows[0]);
      }else {
        console.log('did NOT find city in DB:', city);
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
        superagent.get(url)
          .then(results => {
            let location = new Location(results.body[0], city);
            response.status(200).send(location);
          }).catch(err => console.error(err));
      }
    });
});

app.get('/weather', (request, response) => {
  let weather = [];
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${lon}`;
  superagent.get(url)
    .then(results => {
      let wData = results.body.daily.data;
      wData.map(day => {
        let newDay = new Weather(day);
        weather.push(newDay);
      });
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

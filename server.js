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

app.get('/location', (request, response) => {
  // this is the city that the front end is sending us in the qurey
  // the query lives in the url after the ? htt://cooldomain.com?city=seattle
  try{


    let city = request.query.city;
    console.log('😎', city);
    let geo = require('./data/geo.json');

    // find information on that city and send it back to the front end
    // {
    //   "search_query": "seattle",
    //   "formatted_query": "Seattle, WA, USA",
    //   "latitude": "47.606210",
    //   "longitude": "-122.332071"
    // }

    let location = new Location(geo[0], city)

    // let dataObj = {
    //   search_query: city,
    //   formatted_query: geo[0].display_name,
    //   latitude: geo[0].lat,
    //   longitude: geo[0].lon
    // }

    response.send(location);
  }
  catch(err){
    console.error(err);
  }
})

function Location(obj, city){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.get('*', (request, response) => {
  response.status(404).send('there is nothing on this page');
})

// turn on the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
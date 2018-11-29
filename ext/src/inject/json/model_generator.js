
var fs = require('fs');
var contents = fs.readFileSync('models.json');
// Define to JSON type
var cars = JSON.parse(contents);
// Get Value from JSON

var models = {};

Object.keys(cars).forEach( function (car) {
  cars[car]['keywords'].forEach(function(keyword){
    models[keyword] = car;
  });
});

fs.writeFileSync('models_generated.json', JSON.stringify(models, null, 2));

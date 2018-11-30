const fs = require('fs');

const contents = fs.readFileSync('makes.json');
// Define to JSON type
const cars = JSON.parse(contents);
// Get Value from JSON

const models = {};

Object.keys(cars).forEach(car => {
  cars[car].keywords.forEach(keyword => {
    models[keyword.toLowerCase()] = car.toLowerCase();
  });
});

fs.writeFileSync('makes_generated.json', JSON.stringify(models, null, 2));

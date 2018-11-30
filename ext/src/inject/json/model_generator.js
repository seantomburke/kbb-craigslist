const fs = require('fs');

const contents = fs.readFileSync('models.json');
// Define to JSON type
const cars = JSON.parse(contents);
// Get Value from JSON

const models = {};

Object.keys(cars).forEach(car => {
  cars[car].keywords.forEach(keyword => {
    models[keyword] = car;
  });
});

fs.writeFileSync('models_generated.json', JSON.stringify(models, null, 2));

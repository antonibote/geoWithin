const MongoClient = require('mongodb').MongoClient;

// Replace the connection string and database name with your MongoDB details
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'greenguard';

// Create a GeoJSON point
const point = {
  type: 'Point',
  coordinates: [99, 0]
};

// Connect to MongoDB
MongoClient.connect(uri)
  .then((client) => {
    const db = client.db(dbName);
    const collection = db.collection('textureclasses');

    // Find all polygons
    return collection.find({}).toArray();
  })
  .then((polygons) => {
    // Check if the point is within any polygon
    const foundPolygon = polygons.find((polygon) => {
      const coordinates = polygon.geometry.coordinates.map(coord => [coord.x, coord.y]);
      return isPointInPolygon(point.coordinates, coordinates);
    });

    if (foundPolygon) {
      console.log('Point is within polygon:', foundPolygon.name);
    } else {
      console.log('Point is not within any polygon.');
    }
  })
  .catch((err) => {
    console.error(err);
  });

// Function to check if a point is within a polygon
function isPointInPolygon(point, polygon) {
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

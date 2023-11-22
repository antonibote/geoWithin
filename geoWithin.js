const MongoClient = require('mongodb').MongoClient;

// Replace the connection string and database name with your MongoDB details
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'greenguard';

// Values sent by the frontend
const B = 40 /* Set the value of B from the frontend */;
const C = 20 /* Set the value of C from the frontend */;

// Calculate new values
const x = B + C / 2;
const y = C;

// Create a GeoJSON point
const point = {
  type: 'Point',
  coordinates: [x, y]
};

// Connect to MongoDB
MongoClient.connect(uri)
  .then((client) => {
    const db = client.db(dbName);
    const collection = db.collection('textureclasses');

    // Find all polygons
    return collection.find({}).toArray()
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
      })
      .finally(() => {
        // Close the connection after use
        client.close();
      });
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

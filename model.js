var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scraper');
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});
var BuildingSchema = new mongoose.Schema({
  name: String
});
module.exports = mongoose.model('Building', BuildingSchema);


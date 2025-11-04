const mongoose = require("mongoose");

async function connect(uri) {
mongoose.set("strictQuery", true);
await mongoose.connect(uri);
console.log("MongoDB conectado:", mongoose.connection.name);
}
module.exports = { connect };
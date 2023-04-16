// Express app setup
const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/router.js");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
const PORT = process.env.PORT || 8000;

// API Routing
app.use("/gallery", router);

// Starting server
app.listen(PORT, (error) => {
if (!error) {
    console.log(`Server is listening on port ${PORT}`);
} else {
    console.log(`Error: ${error}`);
}
});
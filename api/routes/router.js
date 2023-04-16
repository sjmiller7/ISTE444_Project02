const router = require("express").Router();
const app = require("../controllers/controller");

// Test route to see if everyone is connected
router.get("/test", app.test);

module.exports = router;
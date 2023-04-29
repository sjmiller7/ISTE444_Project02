const router = require("express").Router();
const app = require("../controllers/controller");

// Test route to see if everyone is connected
router.get("/test", app.test);

// Route for logging in
router.post("/enter", app.enter);

// Route for viewing all art pieces 
router.get("/view", app.view);

// Route for viewing one art piece
router.get("/view/:artID", app.viewOne);

// Route for updating art piece
router.post("/donate", app.donate);

// Route for updating art piece
router.put("/curate", app.curate);

// Route for updating art piece
router.delete("/steal", app.steal);

module.exports = router;
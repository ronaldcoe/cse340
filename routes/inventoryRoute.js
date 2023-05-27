const utilities = require("../utilities")
// Needed Resources
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:cardId", utilities.handleErrors(invController.buildByCarId))

router.get('/trigger-error', utilities.handleErrors(invController.triggerError));

  
module.exports = router;
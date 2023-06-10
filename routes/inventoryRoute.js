const utilities = require("../utilities")
// Needed Resources
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inventory-validation')

router.get("/", utilities.handleErrors(invController.buildManagement))
router.get("/add-classification", utilities.handleErrors(invController.builNewClassification))
router.get("/add-inventory", utilities.handleErrors(invController.builNewInventory))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:cardId", utilities.handleErrors(invController.buildByCarId))


// New classification post
router.post('/add-classification', 
            invValidate.addClassificationRule(),
            invValidate.checkClassData,
            utilities.handleErrors(invController.createClassification)
)

router.post('/add-inventory',
            invValidate.addInventoryRule(),
            invValidate.checkInvData,
            utilities.handleErrors(invController.createInventory)    
)

router.get('/trigger-error', utilities.handleErrors(invController.triggerError));

  
module.exports = router;
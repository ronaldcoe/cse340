const utilities = require("../utilities")
// Needed Resources
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inventory-validation')

router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.builNewClassification))
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.builNewInventory))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:cardId", utilities.handleErrors(invController.buildByCarId))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to edit vehicle
router.get("/edit/:carID", utilities.checkAccountType, utilities.handleErrors(invController.buildEditById))

// Route to delete vehicle
router.get('/delete/:carID', utilities.checkAccountType, utilities.handleErrors(invController.deleteConfirmation))
router.post('/delete', utilities.checkAccountType, utilities.handleErrors(invController.deleteVehicle))

router.post("/update",utilities.checkAccountType,  invValidate.addInventoryRule(),
                        invValidate.checkUpdateData,
                        utilities.handleErrors(invController.updateInventory))

// New classification post
router.post('/add-classification', 
            utilities.checkAccountType,
            invValidate.addClassificationRule(),
            invValidate.checkClassData,
            utilities.handleErrors(invController.createClassification)
)

router.post('/add-inventory',
            utilities.checkAccountType,
            utilities.checkAccountType,
            invValidate.addInventoryRule(),
            invValidate.checkInvData,
            utilities.handleErrors(invController.createInventory)    
)

router.get('/trigger-error', utilities.handleErrors(invController.triggerError));

  
module.exports = router;
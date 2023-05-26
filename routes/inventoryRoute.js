// Needed Resources
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:cardId", invController.buildByCarId)

router.get('/trigger-error', (req, res, next) => {
    // Throw an intentional error to trigger a 500-type error
    throw new Error('Intentional error');
  });

  
module.exports = router;
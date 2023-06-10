const invModel = require("../models/inventory-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


validate.addClassificationRule = () => {
    return [
        body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .isAlpha()
        .withMessage("Please provide classification name.")
        .custom(async (classification_name) => {
            const className = await invModel.checkExistingClassification(classification_name)
            if (className){
                throw new Error("Classification exists. Please use a different name")
            }
        })
    ]
}


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
  validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "New Classification",
        nav,
        classification_name, 
      })
      return
    }
    next()
  }







  validate.addInventoryRule = () => {
    return [
        body("classification_id")
        .trim()
        .isLength({min:1})
        .withMessage("Please select a classification"),

        body("inv_make")
        .trim()
        .isLength({ min: 3 })
        .isAlpha()
        .withMessage("Please provide a valid Make with min 3 characters.."),

        body("inv_model")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Please provide a valid Model with min 3 characters.."),

        body("inv_description")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Please provide a valid Description with min 10 characters."),
        
        body("inv_image")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Please provide a valid path /images/vehicles/no-image.png"),
        
        body("inv_thumbnail")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Please provide a valid thumbnail /images/vehicles/no-image.png"),


        body("inv_price")
        .trim()
        .isFloat({ min: 0.01 })
        .withMessage("Please provide a valid price decimal or integer"),

        body("inv_year")
        .trim()
        .matches(/^\d{4}$/)
        .withMessage("Please provide a valid four-digit year"),


        body("inv_miles")
        .trim()
        .isLength({min: 1})
        .withMessage("The vehicle's color is required"),

    ]
}


  /* ******************************
 * Check data and return errors or continue to adding
 * ***************************** */
  validate.checkInvData = async (req, res, next) => {
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let select = await utilities.buildSelectInv()
      res.render("inventory/add-inventory", {
        errors,
        title: "New Vehcile",
        nav,
        select,
        inv_make, 
        inv_model, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_year, 
        inv_miles, 
        inv_color,
      })
      return
    }
    next()
  }



module.exports = validate
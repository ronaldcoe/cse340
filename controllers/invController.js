const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByCarId = async function (req, res, next) {
  const car_id = req.params.cardId
  const data = await invModel.getCarById(car_id)
  const grid = await utilities.buildByCarId(data)
  let nav = await utilities.getNav()
 
  // console.log(className)
  res.render("./inventory/classification", {
    title: data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model ,
    nav,
    grid,
  })

  
}


invCont.triggerError = (req, res, next) => {
  try {
    // Perform any necessary operations here

    // Throw an intentional error to trigger a 500-type error
    throw new Error('Intentional error');
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};

module.exports = invCont
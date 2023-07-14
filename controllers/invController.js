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
    errors: null,
  })
}

invCont.buildByCarId = async function (req, res, next) {
  const car_id = req.params.cardId
  const data = await invModel.getCarById(car_id)
  const grid = await utilities.buildByCarId(data)
  let nav = await utilities.getNav()
 
 
  res.render("./inventory/classification", {
    title: data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model ,
    nav,
    grid,
    errors: null,
  })

  
}

invCont.buildManagement = async function (req, res, next) {
  
 
  let nav = await utilities.getNav()
  
  const classificationSelect = await utilities.buildClassificationList()
 
  res.render("./inventory/dashboard", {
    title: "Vehicle Management" ,
    nav,
    errors: null,
    classificationSelect: classificationSelect
  })

  
}

invCont.builNewClassification = async function (req, res, next) {
  
 
  let nav = await utilities.getNav()
 
 
  res.render("./inventory/add-classification", {
    title: "New Classification" ,
    nav,
    errors: null,
  })

  
}


invCont.builNewInventory = async function (req, res, next) {
  
 
  let nav = await utilities.getNav()
  let select = await utilities.buildSelectInv()
 
  res.render("./inventory/add-inventory", {
    title: "New Vehicle" ,
    nav,
    select,
    errors: null,
  })

  
}
invCont.triggerError = (req, res, next) => {
  try {

    throw new Error('Intentional error');
  } catch (error) {
    
    next(error);
  }
};

// Handle New Classification

invCont.createClassification = async function (req, res) {
  
  const { classification_name } = req.body


  const classResult = await invModel.createClassification(
    classification_name
  )


  if (classResult) {
    let nav = await utilities.getNav()
    req.flash(
      "notice",
      `Congratulations, you\'re created the ${classification_name} classification.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "New Classification",
      nav,
      errors:null,
    })
  } else {
    req.flash("notice", "Sorry, the new classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "New Classification",
      nav,
      errors
    })
  }
}



// Handle New Inventory

invCont.createInventory = async function (req, res) {
  
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body


  const classResult = await invModel.createInventory(
    classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )


  if (classResult) {
    let nav = await utilities.getNav()
    let select = await utilities.buildSelectInv(classification_id)
    req.flash(
      "notice",
      `Congratulations, you added the ${inv_year} ${inv_make} ${inv_model} to the inventory.`
    )
    res.status(201).render("inventory/add-inventory", {
      title: "New Vehicle",
      nav,
      errors:null,
      select
    })
  } else {
    req.flash("notice", "Sorry, the new classification failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "New Vehicle",
      nav,
      errors,
      select
    })
  }
}



/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}




invCont.buildEditById = async function (req, res, next) {
  
  const car_id = parseInt(req.params.carID)
  let nav = await utilities.getNav()
  const data = await invModel.getCarById(car_id)
  let select = await utilities.buildSelectInv(data[0].classification_id)

  const itemName = `${data[0].inv_make} ${data[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName ,
    nav,
    select,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_description: data[0].inv_description,
    inv_image: data[0].inv_image,
    inv_thumbnail: data[0].inv_thumbnail,
    inv_price: data[0].inv_price,
    inv_miles: data[0].inv_miles,
    inv_color: data[0].inv_color,
    classification_id: data[0].classification_id
  })


}



invCont.updateInventory = async function (req, res) {
  
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body


  const classResult = await invModel.updateInventory(
    classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id
  )


  if (classResult) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildSelectInv()
    req.flash(
      "notice",
      `Congratulations, the ${inv_year} ${inv_make} ${inv_model} was updated.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title:"Vehicle Management"  ,
      nav,
      errors,
       classificationSelect: classificationSelect,
    })
  }
}




// Delete confirmation

invCont.deleteConfirmation = async function (req, res) {
  
  
  const car_id = parseInt(req.params.carID)
  let nav = await utilities.getNav()
  const data = await invModel.getCarById(car_id)


  const itemName = `${data[0].inv_make} ${data[0].inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName ,
    nav,
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_description: data[0].inv_description,
    inv_image: data[0].inv_image,
    inv_thumbnail: data[0].inv_thumbnail,
    inv_price: data[0].inv_price,
    inv_miles: data[0].inv_miles,
    inv_color: data[0].inv_color,
    classification_id: data[0].classification_id
  })

}


// Delete item

invCont.deleteVehicle = async function (req, res) {
  
  const { inv_id } = req.body


  const classResult = await invModel.deleteInventory(
    inv_id
  )


  if (classResult) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("notice","Congrats, the item was deleted")
    res.status(201).render("inventory/dashboard", {
      title: "Vehicle Management",
      nav,
      errors:null,
      classificationSelect: classificationSelect
    })
    
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/delete-inventory", {
      title:" Delete Inventory"  ,
      nav,
      errors,
       classificationSelect: classificationSelect,
    })
  }
}


module.exports = invCont
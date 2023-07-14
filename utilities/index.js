const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()

  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}
Util.buildByCarId = async function(data) {
  let grid
  if(data.length > 0) {
    
    grid = '<div class="car_display">'
    grid += `<img src="${data[0].inv_image}" alt="${data[0].inv_model}">`
    grid += `<div><h2>${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}</h2>
    <p><b>Price: $${new Intl.NumberFormat('en-US').format(data[0].inv_price)}</b></p>
    <p><b>Description:</b> ${data[0].inv_description}</p>
    <p><b>Color:</b> ${data[0].inv_color}</p>
    <p><b>Miles:</b> ${new Intl.NumberFormat('en-US').format(data[0].inv_miles)}<p></div></div>
    `
 
  } else {
    grid = "<p>No found<p>"
  }
  return grid
}

Util.buildSelectInv = async function(optionSelected) {
  let data = await invModel.getClassifications()
  let select = '<select name="classification_id" required>'
  select += '<option value="">Select a Classification</option>'
  data.rows.forEach((row) => {
    select += `<option value="${row.classification_id}" ${row.classification_id === Number(optionSelected)? 'selected':''}>${row.classification_name}</option>`
  })
  select += "</select>"
  return select
}




/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)





/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}


// Check account type 
Util.checkAccountType = (req, res, next) => {

  // Check if the account type is 'Employee' or 'Admin'
  if (res.locals.loggedin) {
    const account_type = res.locals.accountData.account_type; // Get the account type from the payload

    if (account_type === 'Employee' || account_type === 'Admin') {
      next(); // continue
    } else {
      req.flash("notice", "You don't have permission to access this page")
      res.status(403).redirect("/account/login")
    }
  } else {
      req.flash("notice", "You don't have permission to access this page")
      res.status(403).redirect("/account/login")
  }
}

Util.buildClassificationList = async (optionSelected) => {
  let data = await invModel.getClassifications()
  let select = '<select name="classification_id" id="classificationList" required>'
  select += '<option value="">Select a Classification</option>'
  data.rows.forEach((row) => {
    select += `<option value="${row.classification_id}" ${row.classification_id === Number(optionSelected)? 'selected':''}>${row.classification_name}</option>`
  })
  select += "</select>"
  return select
}

// Bild message table
Util.buildMessageTable = async function(dataMessage) {

  let table = '<table>'
  table += '<thead><th>Recieved</th><th>Subject</th><th>From</th><th>Read</th></thead>'
  dataMessage.forEach((row) => {
    table += '<tr>'
    table += `<td>${row.message_created}</td> 
              <td><a href="/account/message/${row.message_id}" >${row.message_subject}</a></td>
              <td>${row.message_from}</td>
              <td>${row.message_read}</td>
              `
  })
  table += '</table>'
  return table
}


// Build toSelect 
Util.buildToSelect =  async function(data, message_to) {
 
  let select = '<select name="message_to">'
  data.forEach((row) => {

    select += `<option value="${row.account_id}" ${message_to == row.account_id?"selected":""}>${row.account_firstname}</option>`
  })
  select += '</select>'
  return select
}

module.exports = Util
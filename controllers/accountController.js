const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */

async function buildLogin(req, res, next) {
 
    let nav = await utilities.getNav()
    req.flash("notice", "All fields are required.")
    res.render("account/login", {
        title:"Login",
        nav,
        errors: null,
    })
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "All fields are required.")
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver Account view
* *************************************** */
async function builAccount(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title:"Account Management",
    nav,
    errors:null,
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body


    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  }



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account/")
   } else {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
   }
  } catch (error) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
 }

/* ****************************************
 *  Process the update account view
 * ************************************ */
async function updateAccountView(req, res) {
  const account_id = parseInt(req.params.accountId)
  let nav = await utilities.getNav()
  const data = await accountModel.getAccountById(account_id)
  console.log(data)
  res.render("./account/edit-account",
    {
      title: "Edit Account",
      nav,
      errors:null,
      account_firstname: data.account_firstname,
      account_lastname: data.account_lastname,
      account_email: data.account_email,
      account_id: account_id
    }
  )

}

  
/* ****************************************
 *  Process the update account post
 * ************************************ */
async function updateAccount(req, res) {
  const {account_firstname, account_lastname, account_email, account_id} = req.body
  let nav = await utilities.getNav()
  const accountResult = await accountModel.updateAccount(
    account_firstname, account_lastname, account_email, account_id
  ) 
  const accountData = await accountModel.getAccountById(account_id)   
  if (accountResult) {  
    try {
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
      
     } catch (error) {
      return new Error('Access Forbidden')
     }
    
    // res.render("./account/edit-account",)
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render(`account/edit-account/${account_id}`, {
      title:"Edit Account"  ,
      nav,
      errors,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      account_email: account_email
      
    })
  }

}

async function updatePassword(req, res) {
  const { account_password, account_id } = req.body
  console.log(account_password, "password")
  let nav = await utilities.getNav()
  let hashedPassword = await bcrypt.hashSync(account_password, 10)
  const accountPassword = await accountModel.updatePassword(account_id,hashedPassword)
  const accountData = await accountModel.getAccountById(account_id) 
  if (accountPassword) {  
    try {
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      req.flash("notice", "Password Updated")
      return res.redirect("/account/")
      
     } catch (error) {
      return new Error('Access Forbidden')
     }
    
    // res.render("./account/edit-account",)
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render(`account/edit-account/${account_id}`, {
      title:"Edit Account"  ,
      nav,
      errors,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      account_email: account_email
      
    })
  }

}

module.exports = {buildLogin, buildRegister, registerAccount, builAccount, accountLogin, updateAccountView, updateAccount, updatePassword}
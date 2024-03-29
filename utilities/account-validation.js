const accountModel = require("../models/account-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
        }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }




  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }



/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (!emailExists){
            throw new Error("Email doesn't exist")
        }
        }),
    // password is required and must be strong password
    body("account_password")
    .trim()
    .isStrongPassword({
      minLength: 1,
    })
    .withMessage("Please enter password"),
  ]
}


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
  validate.checkLogInData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Log in",
        nav,
        account_email,
      })
      return
    }
    next()
  }









/*  **********************************
 *  uPDATe Data Validation Rules
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id; // Access account_id from the request body
        const accountData = await accountModel.getAccountById(accountId);
        const emailExists = await accountModel.checkExistingEmail(account_email);
        
        if (emailExists && account_email !== accountData.account_email) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),
  ];
};



  /* ******************************
 * Check data and return errors or continue to update
 * ***************************** */
  validate.checkUpdateData = async (req, res, next) => {
    const {account_firstname, account_lastname, account_email, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/edit-account", {
        errors,
        title: "Edit Account",
        nav,
        account_firstname, account_lastname, account_email, account_id
      })
      return
    }
    next()
  }




/*  **********************************
 *  Password Data Validation Rules
 * ********************************* */
validate.passwordUpdateRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
    .trim()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
  ]
}


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
  validate.checkPasswordData = async (req, res, next) => {
    const { account_id } = req.body
    const accountData = await accountModel.getAccountById(account_id) 
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/edit-account", {
        errors,
        title: "Edit Account",
        nav,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id
  
      })
      return
    }
    next()
  }





/*  **********************************
 *  New Message Validation Rules
 * ********************************* */
validate.newMessageRules = () => {
  return [
    
    body("message_subject")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a subject."),

      body("message_body")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a body."),
  ]
}



  /* ******************************
 * Check data and return errors or continue to new message
 * ***************************** */
  validate.checkMessageData = async (req, res, next) => {
    const { message_subject, message_body, message_to } = req.body
    let errors = []
    errors = validationResult(req)


    const data = await accountModel.getAccounts()

    let select = await utilities.buildToSelect(data, message_to)

    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/new-message", {
        errors,
        title: "Log in",
        nav,
        select,
        message_to,
        message_subject,
        message_body
      })
      return
    }
    next()
  }



module.exports = validate
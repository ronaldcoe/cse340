const utilities = require("../utilities")
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.builAccount))
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get('/register', utilities.handleErrors(accountController.buildRegister))

router.post('/register', 
        regValidate.registationRules(),
        regValidate.checkRegData,
        utilities.handleErrors(accountController.registerAccount)
    )


// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogInData,
    utilities.handleErrors(accountController.accountLogin)
  )

// Process the account update
router.get("/edit-account/:accountId", utilities.handleErrors(accountController.updateAccountView))
router.post("/edit-account/", 
            regValidate.updateRules(),
            regValidate.checkUpdateData,
            utilities.handleErrors(accountController.updateAccount)
)


router.post("/edit-password/", 
            regValidate.passwordUpdateRules(),
            regValidate.checkPasswordData,
            utilities.handleErrors(accountController.updatePassword)
)

module.exports = router
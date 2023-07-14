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
router.get("/edit-account/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.updateAccountView))
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

// Inbox
router.get("/inbox/", utilities.checkLogin, utilities.handleErrors(accountController.inboxView))

router.get("/new-message", utilities.checkLogin, utilities.handleErrors(accountController.newMessageView))

router.post("/new-message",
            regValidate.newMessageRules(),
            regValidate.checkMessageData,
            utilities.handleErrors(accountController.sendNewMessage)
)
router.get("/message/:messageId", utilities.checkLogin, utilities.handleErrors(accountController.showMessage))

// Delete message confirmation
router.get("/message/delete/:messageId", utilities.checkLogin, utilities.handleErrors(accountController.deleteConfirmationView))


router.post("/message/delete", utilities.handleErrors(accountController.deleteMessageById))


router.post("/message/read", utilities.handleErrors(accountController.markAsRead))
// Archive
router.get("/archive", utilities.checkLogin, utilities.handleErrors(accountController.buildArchived))
router.post("/message/archive-message", utilities.checkLogin, utilities.handleErrors(accountController.archiveMessageById))
// Reply message

router.post("/message/reply", utilities.handleErrors(accountController.sendReply))
router.get("/message/reply/:messageId", utilities.checkLogin, utilities.handleErrors(accountController.replyView))


module.exports = router
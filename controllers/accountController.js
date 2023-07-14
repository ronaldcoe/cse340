const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */

async function buildLogin(req, res, next) {
    // const account_id = req.locals.accountData.account_id

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
  const jwtToken = req.cookies.jwt;
  const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
  
  
  
  const countUnread = await accountModel.getUnreadMessageCount(decodedPayload.account_id)
  res.render("account/account", {
    title:"Account Management",
    nav,
    errors:null,
    countUnread:countUnread,
   
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



// Inbox


/* ****************************************
 * Show inbox
 * ************************************ */
async function inboxView(req, res) {

  let nav = await utilities.getNav()
  
  const jwtToken = req.cookies.jwt;
  const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
    
  const data = await accountModel.getMessagesById(decodedPayload.account_id)
  const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)

  let table = await utilities.buildMessageTable(data)
  res.render("./account/inbox",
    {
      title: "Inbox",
      nav,
      table,
      errors:null,
      countArchived
    }
  )

}

/* ****************************************
 *  Process the new message view
 * ************************************ */
async function newMessageView(req, res) {

  let nav = await utilities.getNav()
  const data = await accountModel.getAccounts()

  let select = await utilities.buildToSelect(data)
  res.status(201).render("./account/new-message",
    {
      title: "New message",
      nav,
      errors:null,
      select
    }
  )

}

/* ****************************************
 *  Process the send message
 * ************************************ */
async function sendNewMessage(req, res) {
  const {message_subject, message_body, message_to, message_from} = req.body
  let nav = await utilities.getNav()

 


  const messageResult = await accountModel.sendNewMessage(
    message_subject, message_body, message_body, message_to, message_from
  ) 
    if(messageResult) {

      const jwtToken = req.cookies.jwt;
      const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
      const data = await accountModel.getMessagesById(decodedPayload.account_id)

      const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)
      let table = await utilities.buildMessageTable(data)
    
      req.flash("notice", "Message sent")
      res.status(201).render("./account/inbox", {
        title:"Inbox",
        nav,
        errors:null,
        table:table,
        countArchived
        
      })
    }
}


  // Show individual message
  async function showMessage(req, res) {
    let nav = await utilities.getNav()
    const message_id = parseInt(req.params.messageId)
    const data = await accountModel.getMessageById(message_id)
    const archived = data[0].message_archived
    console.log(archived)
    res.status(201).render("./account/message",
      {
        title: "Message",
        nav,
        errors:null,
        data,
        archived
      }
    )
  
}

  // Show delete confirmation
  async function deleteMessageById(req, res) {
    let nav = await utilities.getNav()
    const {message_id} = req.body
    let messageSendResult = await accountModel.deleteMessageById(message_id)

    if (messageSendResult) {
      const jwtToken = req.cookies.jwt;
      const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
      const data = await accountModel.getMessagesById(decodedPayload.account_id)
      const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)
      let table = await utilities.buildMessageTable(data)
      
      req.flash("notice", "Message was deleted")
      res.status(201).render("./account/inbox",
        {
          title: "Inbox",
          nav,
          errors:null,
          table:table,
          countArchived:countArchived
        }
      )
    }
  
}

  // Show delete confirmation
  async function deleteConfirmationView(req, res) {
    let nav = await utilities.getNav()

    res.status(201).render("./account/delete-message",
      {
        title: "Message",
        nav,
        errors:null,
      
      }
    )
  
}


// Reply message

async function replyView(req, res) {
  let nav = await utilities.getNav()
  const message_id = parseInt(req.params.messageId)
  const data = await accountModel.getMessageById(message_id)

  res.status(201).render("./account/reply",
    {
      title: "Reply",
      nav,
      errors:null,
      message_id:message_id,
      data:data
    }
  )

}


// Reply message

async function sendReply(req, res) {
  const {message_body, message_id, message_from, message_to} = req.body

  let nav = await utilities.getNav()
  let replyResult = await accountModel.sendReply(message_body, message_id, message_from, message_to)
  



    if(replyResult) {

      const jwtToken = req.cookies.jwt;
      const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
      const data = await accountModel.getMessagesById(decodedPayload.account_id)
      const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)
      
      let table = await utilities.buildMessageTable(data)
    
      req.flash("notice", "Reply sent")
      res.status(201).render("./account/inbox", {
        title:"Inbox",
        nav,
        errors:null,
        table:table,
        countArchived
      })
    }
}


// Mark as read
async function markAsRead(req, res) {
  const {message_id} = req.body

  let nav = await utilities.getNav()
  let replyResult = await accountModel.markRead(message_id)



    if(replyResult) {

      const jwtToken = req.cookies.jwt;
      const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
      const data = await accountModel.getMessagesById(decodedPayload.account_id)
      const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)

      
      let table = await utilities.buildMessageTable(data)
    
      req.flash("notice", "Message marked as read")
      res.status(201).render("./account/inbox", {
        title:"Inbox",
        nav,
        errors:null,
        table:table,
        countArchived:countArchived
      })
    }
}



/* ****************************************
 * Show archived
 * ************************************ */
async function buildArchived(req, res) {

  let nav = await utilities.getNav()
  
  const jwtToken = req.cookies.jwt;
  const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
  const data = await accountModel.getMessagesByIdArchived(decodedPayload.account_id)
  console.log(data)

  let table = await utilities.buildMessageTable(data)
  res.render("./account/archived",
    {
      title: "Inbox",
      nav,
      errors:null,
      table
    }
  )

}




// Archive message by id
 // Show delete confirmation
 async function archiveMessageById(req, res) {
  let nav = await utilities.getNav()
  const {message_id} = req.body
  let messageSendResult = await accountModel.archiveMessageById(message_id)

  if (messageSendResult) {
    const jwtToken = req.cookies.jwt;
    const decodedPayload = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET,);
    const data = await accountModel.getMessagesById(decodedPayload.account_id)
    const countArchived = await accountModel.getArchivedMessageCount(decodedPayload.account_id)
    let table = await utilities.buildMessageTable(data)
    
    req.flash("notice", "Message was marked as Archived")
    res.status(201).render("./account/inbox",
      {
        title: "Inbox",
        nav,
        errors:null,
        table:table,
        countArchived:countArchived
      }
    )
  }

}
module.exports = {buildLogin, buildRegister, registerAccount, builAccount, accountLogin, updateAccountView, updateAccount, updatePassword, inboxView, newMessageView, sendNewMessage, showMessage, deleteConfirmationView, deleteMessageById, replyView, sendReply, markAsRead, buildArchived, archiveMessageById}
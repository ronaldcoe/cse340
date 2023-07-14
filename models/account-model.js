const pool = require("../database")



/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"

      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])

    } catch (error) {
      console.log(error.message)
      return error.message
      
    }
  
}



/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}



/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

// Porcess the update account post
async function updateAccount (account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql =
    "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    return await pool.query(sql, [
      account_firstname, 
      account_lastname, 
      account_email, 
      parseInt(account_id)
    ]);
  } catch (error) {
    console.error("Error in query:", error.message);
    throw error;
  }
}

async function updatePassword (account_id, hashedPassword) {
  try {
    const sql =
    "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    return await pool.query(sql, [
      hashedPassword, 
      parseInt(account_id)
    ]);
  } catch (error) {
    console.error("Error in query:", error.message);
    throw error;
  }
}



/* *****************************
* Return account messages by account id
* ***************************** */
async function getMessagesById(account_id) {
  try {
    const result = await pool.query(
      'SELECT m.message_id, m.message_subject, m.message_body, TO_CHAR(m.message_created, \'YYYY-MM-DD HH24:MI:SS\') AS message_created, m.message_to, a.account_firstname AS message_from, m.message_read, m.message_archived FROM message m JOIN account a ON m.message_from = a.account_id WHERE m.message_to = $1 AND m.message_archived = false',
      [account_id]
    );
    return result.rows;
  } catch (error) {
    throw new Error('No matching id found');
  }
}

/* *****************************
* Return account messages by account id and archived
* ***************************** */
async function getMessagesByIdArchived(account_id) {

  try {
    const result = await pool.query(
      'SELECT m.message_id, m.message_subject, m.message_body, TO_CHAR(m.message_created, \'YYYY-MM-DD HH24:MI:SS\') AS message_created, m.message_to, a.account_firstname AS message_from, m.message_read, m.message_archived FROM message m JOIN account a ON m.message_from = a.account_id WHERE m.message_to = $1 AND m.message_archived = true',
      [parseInt(account_id)]
    );
    return result.rows;
  } catch (error) {
    // throw new Error(error);
    console.log("Erros here")
  }
}

async function getAccounts () {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account')
    return result.rows
  } catch (error) {
    return new Error("No accounts found")

  }
}




/* *****************************
*  Send a new message
* *************************** */
async function sendNewMessage(message_subject, message_body, message_body, message_to, message_from){
  try {
      
    const sql = "INSERT INTO message (message_subject, message_body, message_to, message_from) VALUES ($1, $2, $3, $4) RETURNING *"

    return await pool.query(sql, [message_subject, message_body, parseInt(message_to), parseInt(message_from)])

  } catch (error) {
    console.log(error.message)
    return error.message
    
  }

}


/* *****************************
*  Send reply
* *************************** */
async function sendReply(message_body, message_id, message_from, message_to){
  try {
      
    const sql = "UPDATE message SET message_body = $1, message_from = $2, message_to = $3 WHERE message_id = $4 RETURNING *"
    console.log(message_from, "id_from")
    return await pool.query(sql, [ message_body,  parseInt(message_from), parseInt(message_to[1]), parseInt(message_id)])

  } catch (error) {
    console.log(error.message)
    return error.message
    
  }

}

// Get the meessage by Id
async function getMessageById(message_id) {
  console.log(parseInt(message_id))
  try {
    const result = await pool.query(
      `SELECT m.message_id, m.message_subject, m.message_body, TO_CHAR(m.message_created, 'YYYY-MM-DD HH24:MI:SS') AS message_created, m.message_to, a.account_firstname AS message_from, m.message_read, m.message_archived, m.message_from AS from_id FROM message m JOIN account a ON m.message_from = a.account_id WHERE m.message_id = $1`,
      [parseInt(message_id)]
    );
    console.log(result.rows, "here")
    return result.rows;
  } catch (error) {
    throw new Error(error);
  }
}



// Get unread message
async function getUnreadMessageCount(account_id) {

  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_read, message_archived FROM message WHERE message_to = $1 AND message_read = false',
      [parseInt(account_id)]
    );
    return (result.rows).length;
  } catch (error) {
    throw new Error('No matching id found');
  }
}




// Get archived messages
async function getArchivedMessageCount(account_id) {

  try {
    const result = await pool.query(
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_read, message_archived FROM message WHERE message_to = $1 AND message_archived = true',
      [parseInt(account_id)]
    );
    return (result.rows).length;
  } catch (error) {
    throw new Error('No matching id found');
  }
}


// Delete message Confirmation
async function deleteMessageConfirmation(message_id) {

  try {
    const result = await pool.query(
      'DELETE FROM message WHERE message_id = $1;',
      [parseInt(message_id)]
    );
    return (result.rows).length;
  } catch (error) {
    throw new Error('No matching id found');
  }
}



// Delete message
async function deleteMessageById(message_id) {
  console.log(message_id, "message id")
  try {
    const result = await pool.query(
      'DELETE FROM message WHERE message_id = $1;',
      [parseInt(message_id)]
    );
    return result;
  } catch (error) {
    throw new Error(error);
  }
}


/* *****************************
*  Mark as read
* *************************** */
async function markRead(message_id){

  try {
      
    const sql = "UPDATE message SET message_read = $1 WHERE message_id = $2 RETURNING *"
   
    return await pool.query(sql, [ "true", parseInt(message_id)])

  } catch (error) {
    console.log(error.message)
    return error.message
    
  }

}



/* *****************************
*  Mark as archive
* *************************** */
async function markRead(message_id){

  try {
      
    const sql = "UPDATE message SET message_read = $1 WHERE message_id = $2 RETURNING *"
   
    return await pool.query(sql, [ "true", parseInt(message_id)])

  } catch (error) {
    console.log(error.message)
    return error.message
    
  }

}


// Archive Message
async function archiveMessageById(message_id) {
  console.log(message_id, "message id")
  try {
    const result = await pool.query(
      'UPDATE message SET message_archived = true WHERE message_id = $1;',
      [parseInt(message_id)]
    );
    return result;
  } catch (error) {
    throw new Error(error);
  }
}


module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getMessagesById, getMessageById, getAccounts, sendNewMessage, getUnreadMessageCount, deleteMessageById, deleteMessageConfirmation, sendReply, markRead, getArchivedMessageCount, getMessagesByIdArchived, archiveMessageById}
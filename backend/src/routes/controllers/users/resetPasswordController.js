const dbConnection = require('../../../db/dbinitmysql');
const bcrypt = require('bcryptjs');
const passwordgenerator = require('generate-password');

// Sendinblue
const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_APIKEY;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
// Sendinblue end


const createError = require('http-errors');


module.exports = async (req, res, next) => {
  const { email, subject, changedPassword } = req.body;

  const newPassword = changedPassword || passwordgenerator.generate({
    length: 10,
    numbers: true,
  });

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `votre nouveau mot de passe: ${newPassword}`;
  sendSmtpEmail.sender = { "name":"HXF finance", "email":"hxf.finance@gmail.com" };
  sendSmtpEmail.to = [{ "email":email, "name":email }];
  sendSmtpEmail.replyTo = { "email":"hxf.finance@gmail.com", "name":"HXF Finance" };

  const sqlUser = `
    SELECT * FROM Users
    WHERE email="${email}";
  `;

  dbConnection.query(
    sqlUser,
    (err, users) => {
      if (users.length === 0) {
        return next(createError(500, 'no users registered with this email'));
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) console.error('There was an error during salt', err);
          else {
            bcrypt.hash(newPassword, salt, async (err, hash) => {
              if (err) console.error('There was an error during hash', err);
              else {
                const sqlUserUpdatePassword = `
                  UPDATE Users
                  SET password="${hash}"
                  WHERE email="${email}";
                `;
                dbConnection.query(
                  sqlUserUpdatePassword,
                  async () => {
                    await apiInstance.sendTransacEmail(sendSmtpEmail);
                    res.json('sendinblue success');
                  }
                );
              }
            });
          }
        });
      }
    }
  );
};

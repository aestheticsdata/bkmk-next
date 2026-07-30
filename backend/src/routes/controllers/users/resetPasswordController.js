/**
 * ⚠️ **Dead code, and it cannot run.** Audited under COS-295 and deliberately left as it is.
 *
 * Its route in `routes/api/users.js` is commented out, and it could not be mounted anyway:
 * `generate-password` and `sib-api-v3-sdk` are not in `package.json`, so requiring this file
 * throws. It also calls `dbConnection.query(...)` while `dbinitmysql` exports a function that
 * returns a connection — broken even with the packages installed — and the mail it sends is
 * pfa's, "HXF finance" and all.
 *
 * Its two statements interpolate `req.body.email`, which is why it appears in this ticket at
 * all. They are **not** parameterised: nothing reaches them, and making unreachable broken
 * code injection-safe would only make it look maintained. Rewriting it belongs to whoever
 * builds `change password` in the user menu (COS-321).
 */
const dbConnection = require("../../../db/dbinitmysql");
const bcrypt = require("bcryptjs");
const passwordgenerator = require("generate-password");

// Sendinblue
const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_APIKEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
// Sendinblue end

const createError = require("http-errors");

module.exports = async (req, res, next) => {
  const { email, subject, changedPassword } = req.body;

  const newPassword =
    changedPassword ||
    passwordgenerator.generate({
      length: 10,
      numbers: true,
    });

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `votre nouveau mot de passe: ${newPassword}`;
  sendSmtpEmail.sender = { name: "HXF finance", email: "hxf.finance@gmail.com" };
  sendSmtpEmail.to = [{ email: email, name: email }];
  sendSmtpEmail.replyTo = { email: "hxf.finance@gmail.com", name: "HXF Finance" };

  const sqlUser = `
    SELECT * FROM user
    WHERE email="${email}";
  `;

  dbConnection.query(sqlUser, (err, users) => {
    if (users.length === 0) {
      return next(createError(500, "no users registered with this email"));
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.error("There was an error during salt", err);
        else {
          bcrypt.hash(newPassword, salt, async (err, hash) => {
            if (err) console.error("There was an error during hash", err);
            else {
              const sqlUserUpdatePassword = `
                  UPDATE user
                  SET password="${hash}"
                  WHERE email="${email}";
                `;
              dbConnection.query(sqlUserUpdatePassword, async () => {
                await apiInstance.sendTransacEmail(sendSmtpEmail);
                res.json("sendinblue success");
              });
            }
          });
        }
      });
    }
  });
};

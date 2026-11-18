const ejs = require("ejs");
const transporter = require("../../config/email.config.js");

const templates = {
    verification: `${__dirname}/templates/verification.ejs`,
    passwordReset: `${__dirname}/templates/reset-password.ejs`,
    passwordChanged: `${__dirname}/templates/password-changed.ejs`,
    welcome: `${__dirname}/templates/welcome.ejs`
};

const sendEmail = async ({ to, subject, template, data }) => {
    const templateFile = templates[template];
    if (!templateFile) {
        throw new Error(`Email template "${template}" not found.`);
    }

    if (!to || !subject || !data) {
        throw new Error("Missing required email parameters.");
    }

    const html = await ejs.renderFile(templateFile, {
        ...data,
        email: to,
        year: new Date().getFullYear(),
        appUrl: process.env.APP_URL || "http://localhost:3000"
    });
    
    return transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
        attachments: [ {
            filename: "logo.png",
            path: `${__dirname}/assets/logo.png`,
            cid: "chattr-logo"
        },
        {
            filename: "pattern.png",
            path: `${__dirname}/assets/pattern.png`,
            cid: "chattr-pattern"
        }]
    });
}

module.exports = {
    sendEmail
};

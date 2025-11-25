const crypto = require("crypto");
const SibApiV3Sdk = require('sib-api-v3-sdk');
require("dotenv").config();

// Configure Brevo
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const brevoApiKey = brevoClient.authentications['api-key'];
brevoApiKey.apiKey = process.env.BREVO_API_KEY;
const brevoEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const TEMP_PASSWORD_LENGTH = 20;
const PASSWORD_CHARSETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digit: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function getRandomChar(chars = "") {
    if (!chars.length) return "";
    return chars[crypto.randomInt(chars.length)];
}


// Generates a secure temporary password meeting the policy:
// 8+ chars, 1 upper, 1 lower, 1 digit, 1 special char.
 
function generateTemporaryPassword(length = TEMP_PASSWORD_LENGTH) {
    const minLength = Math.max(8, length);
    const requiredChars = [
        getRandomChar(PASSWORD_CHARSETS.upper),
        getRandomChar(PASSWORD_CHARSETS.lower),
        getRandomChar(PASSWORD_CHARSETS.digit),
        getRandomChar(PASSWORD_CHARSETS.special),
    ];
    const combined = PASSWORD_CHARSETS.upper + PASSWORD_CHARSETS.lower + PASSWORD_CHARSETS.digit + PASSWORD_CHARSETS.special;
    
    while (requiredChars.length < minLength) {
        requiredChars.push(getRandomChar(combined));
    }
    
    // Shuffle
    for (let i = requiredChars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
    }
    
    return requiredChars.join("");
}


// Sends the temporary password via Brevo email.

async function sendTemporaryPasswordEmail({ to, name, password }) {
    if (!to) return;
    const sender = { email: process.env.EMAIL_USER, name: 'ResQWave' };
    const receivers = [{ email: to }];
    const displayName = (name || "User").trim() || "User";
    
    await brevoEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'ResQWave Temporary Password',
        htmlContent: `
            <p>Dear ${displayName},</p>
            <p>Your temporary password has been generated:</p>
            <h2 style="letter-spacing:3px; color:#2563eb">${password}</h2>
            <p>This password meets the security policy (8+ characters, uppercase, lowercase, number, special character). Please sign in and change it immediately.</p>
            <p>Thank you,<br/>ResQWave Team</p>
        `,
    });
}

module.exports = {
    generateTemporaryPassword,
    sendTemporaryPasswordEmail
};

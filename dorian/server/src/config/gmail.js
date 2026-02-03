const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

function getTokenFromCode(code) {
  return oauth2Client.getToken(code);
}

function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

module.exports = {
  oauth2Client,
  getAuthUrl,
  getTokenFromCode,
  setCredentials,
  SCOPES,
};

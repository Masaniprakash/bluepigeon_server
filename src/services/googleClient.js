const { google } = require('googleapis');

const GOOGLE_CLIENT_ID = process.env.GoogleOAuthClientId;
const GOOGLE_CLIENT_SECRET = process.env.GoogleOAuthSecret;

exports.oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
);
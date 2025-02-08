import express from 'express';
import _sodium from 'libsodium-wrappers';

if (process.env.NODE_ENV !== 'production') {
  const { config } = await import("dotenv");
  config();
}

const REQUEST_ID = process.env.REQUEST_ID ?? '';
const SIGNING_PRIVATE_KEY = process.env.SIGNING_PRIVATE_KEY ?? '';

const htmlFile = `
<!--Contents of ondc-site-verification.html. -->
<!--Please replace SIGNED_UNIQUE_REQ_ID with an actual value-->
<html>
  <head>
    <meta
      name="ondc-site-verification"
      content="SIGNED_UNIQUE_REQ_ID"
    />
  </head>
  <body>
    ONDC Site Verification Page
  </body>
</html>
`;

// Create an Express application
const router = express.Router();

// Route for serving a verification file
router.get('/', async (req, res) => {
  const signedContent = await signMessage(REQUEST_ID, SIGNING_PRIVATE_KEY);
  // Replace the placeholder with the actual value
  const modifiedHTML = htmlFile.replace(/SIGNED_UNIQUE_REQ_ID/g, signedContent);
  // Send the modified HTML as the response
  res.send(modifiedHTML);
});

async function signMessage(signingString: string, privateKey: string) {
  await _sodium.ready;
  const sodium = _sodium;
  const signedMessage = sodium.crypto_sign_detached(
    signingString,
    sodium.from_base64(privateKey, _sodium.base64_variants.ORIGINAL)
  );
  const signature = sodium.to_base64(
    signedMessage,
    _sodium.base64_variants.ORIGINAL
  );
  return signature;
}

export default router;
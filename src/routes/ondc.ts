import express from 'express';
import crypto from 'crypto';
import bodyParser from 'body-parser';

if (process.env.NODE_ENV !== 'production') {
    const { config } = await import("dotenv");
    config();
}

const ENCRYPTION_PRIVATE_KEY = process.env.ENCRYPTION_PRIVATE_KEY ?? '';
const ONDC_PUBLIC_KEY = process.env.ONDC_PUBLIC_KEY ?? '';

// Pre-defined public and private keys
const privateKey = crypto.createPrivateKey({
    key: Buffer.from(ENCRYPTION_PRIVATE_KEY, 'base64'), // Decode private key from base64
    format: 'der', // Specify the key format as DER
    type: 'pkcs8', // Specify the key type as PKCS#8
});
const publicKey = crypto.createPublicKey({
    key: Buffer.from(ONDC_PUBLIC_KEY, 'base64'), // Decode public key from base64
    format: 'der', // Specify the key format as DER
    type: 'spki', // Specify the key type as SubjectPublicKeyInfo (SPKI)
});

// Calculate the shared secret key using Diffie-Hellman
const sharedKey = crypto.diffieHellman({
    privateKey: privateKey,
    publicKey: publicKey,
});

// Create an Express application
const router = express.Router();
router.use(bodyParser.json()); // Middleware to parse JSON request bodies

// Route for handling subscription requests
router.post('/on_subscribe', function (req, res) {
    const { challenge } = req.body; // Extract the 'challenge' property from the request body
    const answer = decryptAES256ECB(sharedKey, challenge); // Decrypt the challenge using AES-256-ECB
    const resp = { answer: answer };
    res.status(200).json(resp); // Send a JSON response with the answer
});

// Decrypt using AES-256-ECB
function decryptAES256ECB(key: Buffer<ArrayBufferLike>, encrypted: string) {
    const iv = Buffer.alloc(0); // ECB doesn't use IV
    const decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export default router;


const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");
//CONFIG
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const SECRET_PASS = process.env.SECRET_KEY; // replace with your actual value

const removeQuotes = (str) => {
    const trimmedStr = str.trim();
    if (trimmedStr.startsWith('"') && trimmedStr.endsWith('"')) {
        return trimmedStr.substring(1, trimmedStr.length - 1);
    }
    return str;
};

const decryptData = async(text) => {
    try {
        // Remove double quotes from the start and end of the string
        const cleanedText = removeQuotes(text);
        const bytes = CryptoJS.AES.decrypt(cleanedText, SECRET_PASS);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            throw new Error('Failed to decrypt the data. The data might not have been encrypted with the correct key');
        }
        return decryptedText;
    } catch (error) {
        throw new Error('Invalid encrypted data');
    }
};
app.get('/', (req, res) => {
    const form = `
    <style>
        body { display: flex; justify-content: center; align-items: center; height: 90vh; font-family: Arial, sans-serif; }
        form { text-align: center; }
        label, input, button { margin: 10px 0; }
    </style>
    <form action="/decrypt" method="post">
    <h1>HCMD DECRYPTOR</h1>
        <label for="encryptedData">Encrypted Data:</label>
        <input type="text" id="encryptedData" name="encryptedData">
        <button type="submit">Decrypt</button>
    </form>
    `;
    res.send(form);
});

app.post('/decrypt', async (req, res) => {
    const { encryptedData } = req.body;
    try {
        const decryptedData = await decryptData(encryptedData);
        const resultPage = `
        <style>
            body { display: flex; flex-direction:column; justify-content: center; align-items: center;  font-family: Arial, sans-serif; }
            h1 { text-align: center; }
            a { display: block; text-align: center; margin-top: 20px; }
        </style>
        <h4>Result: ${decryptedData}</h4>
        <a href="/">Back</a>
        `;
        res.send(resultPage);
    } catch (error) {
        res.send(`<h1>Error: ${error.message}</h1><a href="/">Back</a>`);
    }
});

app.listen(4000, () => console.log('Server running on port 4000'));
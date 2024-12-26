const express = require("express");
const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeData = null; // Variable to store the latest QR code

(async () => {
  try {
    // Establish MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Initialize MongoStore
    const store = new MongoStore({ mongoose });

    // Initialize WhatsApp client
    const client = new Client({
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000, // 5 minutes
      }),
    });

    // Add event listeners
    client.on("ready", () => {
      console.log("Client is ready!");
    });

    // Listening to all incoming messages
    client.on("message_create", (message) => {
      console.log(message.body);
      // client.sendMessage("Tienes una nueva resserva!")
    });

    // QR CODE GEENERATION
    client.on("qr", (qr) => {
      console.log("QR Code received, generating it as an image...", qr);

      // Store QR code as a data URL
      qrcode.toDataURL(qr, (err, url) => {
        if (err) {
          console.error("Failed to generate QR code", err);
        } else {
          console.log("QR code generated. Check localhost:3000/qr");
          qrCodeData = url; // Save the QR code data URL
        }
      });

    });

    client.on("disconnected", (reason) => {
      console.log("Client disconnected:", reason);
      // Optionally, clear the session if the disconnection is persistent
    });

    client.on("auth_failure", (message) => {
      console.error("Authentication failed:", message);
      // Consider clearing the session and prompting for a new QR code
    });

    // Initialize the client
    client.initialize();
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error);
  }
  
})();


// Route to serve the QR code
app.get("/qr", (req, res) => {
  if (qrCodeData) {
      res.send(`<img src="${qrCodeData}" alt="QR Code" />`);
  } else {
      res.send("QR code not generated yet.");
  }
});


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log("listening from port", PORT);
});

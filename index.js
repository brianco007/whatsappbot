const express = require("express");
const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode-terminal");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Establish MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Initialize MongoStore
    const store = new MongoStore({ mongoose });

    // Initialize WhatsApp client
    const client = new Client({
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

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
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

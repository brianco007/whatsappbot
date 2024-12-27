const express = require("express");
const { Client, RemoteAuth, LocalAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeData = null; // Variable to store the latest QR code

// // Establish MongoDB connection
// await mongoose.connect(process.env.MONGODB_URI);
// console.log("MongoDB connected");

// // Initialize MongoStore
// const store = new MongoStore({ mongoose });

// Initialize WhatsApp client
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
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

// QR CODE GENERATION
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
   // Limpia cualquier estado o sesión, si es necesario
   client.destroy().then(() => {
    client.initialize();
  });
  // Optionally, clear the session if the disconnection is persistent
});

client.on("auth_failure", (message) => {
  console.error("Authentication failed:", message);
  // Consider clearing the session and prompting for a new QR code
});

// Initialize the client
client.initialize();





// *********************** END OF WHATSAPP CLIENT INITIALIZATION  ***********************
app.use(express.json());

// Endpoint to send messages
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body; // Get phone and message from request body
  const chatId = phone.substring(1) + "@c.us"; // Format the phone number

  // if (!client || !client.isReady) {
  //   return res.status(503).json({ error: "Client is not ready" });
  // }

  try {
    const numberDetails = await client.getNumberId(chatId);

    if (numberDetails) {
      await client.sendMessage(chatId, message);
      return res.json({ success: true });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Number not found" });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send message" });
  }
});

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

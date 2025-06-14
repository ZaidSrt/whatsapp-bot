const { Client, Location, Poll, List, Buttons, LocalAuth } = require("whatsapp-web.js");
require("dotenv").config();
const qrcode = require("qrcode-terminal");

const url = "https://api.openai.com/v1/chat/completions";
const keyGPT = process.env.OPENIA_KEY;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${keyGPT}`,
};
const prompt = "Responde como un colaborador que ayuda al usuario";
let global = [];

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Cambia a true para servidores/cloud
    // args: [
    //   "--no-sandbox",
    //   "--disable-setuid-sandbox",
    //   "--disable-dev-shm-usage",
    //   "--disable-accelerated-2d-canvas",
    //   "--no-first-run",
    //   "--no-zygote",
    //   "--single-process",
    //   "--disable-gpu"
    // ]
  },
});

client.on("loading_screen", (percent, message) => console.log("LOADING SCREEN", percent, message));

let pairingCodeRequested = false; // validacion para mandar solo una vez el codigo QR
client.on("qr", async (qr) => {
  qrcode.generate(qr, { small: true });

  const pairingCodeEnabled = false;

  if (pairingCodeEnabled && !pairingCodeRequested) {
    // const pairingCode = await client.requestPairingCode("5542397473"); // AQUI VA EL NUMERO DE WHATSAPP
    const pairingCode = await client.requestPairingCode("5635771892"); // AQUI VA EL NUMERO DE WHATSAPP
    console.log("Pairing code enabled, code: " + pairingCode);
    pairingCodeRequested = true;
  }
});

// CODIGOS DE ERROR
client.on("authenticated", () => console.log(200));
client.on("auth_failure", (msg) => console.error(500, msg));

client.on("ready", async () => {
  console.log("READY");
  const debugWWebVersion = await client.getWWebVersion();
  console.log(`WWebVersion = ${debugWWebVersion}`);

  client.pupPage.on("pageerror", function (err) {
    console.log("Page error: " + err.toString());
  });
  client.pupPage.on("error", function (err) {
    console.log("Page error: " + err.toString());
  });
});

client.on("message", async (msg) => {
  console.log(msg.body);

  if (msg.body) {
    if (!global[msg.notifyName]) {
      global[msg.notifyName] = [];
    }
    global[msg.notifyName].push({ role: "user", content: msg.body });

    try {
      let messages = [...global[msg.notifyName]];
      messages.unshift({ role: "system", content: prompt });

      console.log(messages);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
        }),
      });
      const data = await response.json();
      console.log(data);

      const reply = data.choices?.[0]?.message?.content || "No response from GPT.";
      global[msg.notifyName].push({ role: "system", content: reply });

      client.sendMessage(msg.from, reply);
    } catch (error) {
      await msg.reply("Error al contactar con la API de OpenAI.");
      console.error(error);
    }
  }
});

// FUNCIONES API
function initBot() {
  client.initialize();
}

function sentMessage(from, message) {
  client.sendMessage(from, message);
}

module.exports = { initBot, sentMessage };

const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: process.env.PORT || 9595 });

wss.on("connection", (ws) => {
  console.log("Usuário conectado");

  ws.on("error", console.error);

  ws.on("message", (data) => {
    // Reenvia para todos os outros clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });
});

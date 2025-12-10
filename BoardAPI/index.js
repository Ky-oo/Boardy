const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = {
  users: [
    {
      id: 1,
      firstname: "Alice",
      lastname: "Martin",
      pseudo: "aliceMartin",
      email: "alice@gmail.com",
      password: "azerty",
      city: "Lyon",
      role: "user",
    },
    {
      id: 2,
      firstname: "Bob",
      lastname: "Durand",
      pseudo: "bobDurand",
      email: "bob@gmail.com",
      password: "azerty",
      city: "Lyon",
      role: "user",
    },
    {
      id: 3,
      firstname: "Clara",
      lastname: "Admin",
      pseudo: "claraAdmin",
      email: "clara@gmail.com",
      password: "azerty",
      city: "Paris",
      role: "admin",
    },
  ],
  organisations: [
    {
      id: 1,
      name: "Bar du Meeple",
      address: "12 Rue des Jeux, 69001 Lyon",
      ownerId: 1,
    },
    {
      id: 2,
      name: "Café Stratège",
      address: "5 Avenue des Pions, 69002 Lyon",
      ownerId: 2,
    },
  ],
  activities: [
    {
      id: 1,
      title: "Soirée jeux au Bar du Meeple",
      description: "Découverte de jeux modernes, tous niveaux.",
      gameId: 11,
      date: "2026-03-01T19:30:00.000Z",
      address: "12 Rue des Jeux, 69001 Lyon",
      seats: 16,
      type: "organisation",
      hostId: 1,
      playersId: [1, 2],
    },
    {
      id: 2,
      title: "Partie Catan chez Alice",
      description: "Partie chill de Catan, débutants bienvenus.",
      gameId: 101,
      date: "2025-03-03T20:00:00.000Z",
      address: "Chez Alice, 69003 Lyon",
      seats: 4,
      type: "user",
      hostId: 1,
      playersId: [1, 2],
    },
  ],
  activityPlayers: [
    { id: 1, userId: 1, activitieId: 1, status: "joined" },
    { id: 2, userId: 2, activitieId: 1, status: "joined" },
    { id: 3, userId: 1, activitieId: 2, status: "joined" },
    { id: 4, userId: 2, activitieId: 2, status: "joined" },
  ],
  chats: [
    { id: 1, usersId: null, activitieId: 1 },
    { id: 2, usersId: null, activitieId: 2 },
  ],
  chatUsers: [
    { id: 1, userId: 1, chatId: 1 },
    { id: 2, userId: 2, chatId: 1 },
    { id: 3, userId: 1, chatId: 2 },
    { id: 4, userId: 2, chatId: 2 },
  ],
  messages: [
    {
      id: 1,
      userId: 1,
      chatId: 1,
      content: "Salut, je viendrai vers 20h 🙂",
      createdAt: "2025-02-20T18:00:00.000Z",
    },
    {
      id: 2,
      userId: 2,
      chatId: 1,
      content: "Top ! J'apporte Dixit et Just One.",
      createdAt: "2025-02-20T18:05:00.000Z",
    },
    {
      id: 3,
      userId: 1,
      chatId: 2,
      content: "Je prépare le plateau de Catan 😁",
      createdAt: "2025-02-21T19:00:00.000Z",
    },
  ],
};

// --- Helpers simples ---
function nextId(list) {
  return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
}

// --- Routes USERS ---
app.get("/users", (req, res) => {
  res.json(db.users);
});

app.get("/users/:id", (req, res) => {
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// --- Routes ORGANISATIONS ---
app.get("/organisations", (req, res) => {
  res.json(db.organisations);
});

// --- Routes ACTIVITIES ---
app.get("/activities", (req, res) => {
  res.json(db.activities);
});

app.get("/activities/:id", (req, res) => {
  const activity = db.activities.find((a) => a.id === Number(req.params.id));
  if (!activity) return res.status(404).json({ error: "Activity not found" });
  res.json(activity);
});

app.post("/activities", (req, res) => {
  const data = req.body;
  const newActivity = {
    id: nextId(db.activities),
    title: data.title,
    description: data.description || "",
    gameId: data.gameId || null,
    date: data.date || new Date().toISOString(),
    address: data.address || "",
    seats: data.seats || 0,
    type: data.type || "user",
    hostId: data.hostId || null,
    playersId: [],
  };
  db.activities.push(newActivity);
  res.status(201).json(newActivity);
});

// --- Participants d'une activité ---
app.get("/activities/:id/players", (req, res) => {
  const activityId = Number(req.params.id);
  const players = db.activityPlayers.filter(
    (p) => p.activitieId === activityId
  );
  res.json(players);
});

app.post("/activities/:id/players", (req, res) => {
  const activityId = Number(req.params.id);
  const { userId, status } = req.body;
  const newAP = {
    id: nextId(db.activityPlayers),
    userId,
    activitieId: activityId,
    status: status || "joined",
  };
  db.activityPlayers.push(newAP);
  res.status(201).json(newAP);
});

// --- Chat & messages liés à une activité ---
app.get("/activities/:id/chat/messages", (req, res) => {
  const activityId = Number(req.params.id);
  const chat = db.chats.find((c) => c.activitieId === activityId);
  if (!chat) return res.json([]);
  const msgs = db.messages.filter((m) => m.chatId === chat.id);
  res.json(msgs);
});

app.post("/activities/:id/chat/messages", (req, res) => {
  const activityId = Number(req.params.id);
  const { userId, content } = req.body;

  let chat = db.chats.find((c) => c.activitieId === activityId);
  if (!chat) {
    chat = { id: nextId(db.chats), usersId: null, activitieId: activityId };
    db.chats.push(chat);
  }

  const message = {
    id: nextId(db.messages),
    userId,
    chatId: chat.id,
    content,
    createdAt: new Date().toISOString(),
  };
  db.messages.push(message);
  res.status(201).json(message);
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

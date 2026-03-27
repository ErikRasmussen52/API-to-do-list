const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const FILE = "todos.json";

// Middleware
app.use(express.json());
app.use(express.static("public")); // kobler til nettsiden

// ---------- Hjelpefunksjoner ----------
function readTodos() {
    try {
        const data = fs.readFileSync(FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeTodos(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ---------- API ----------

// 1. GET /todos (liste)
app.get("/todos", (req, res) => {
    const todos = readTodos();

    const simpleList = todos.map(todo => ({
        id: todo.id,
        title: todo.title
    }));

    res.json(simpleList);
});

// 2. GET /todos/:id
app.get("/todos/:id", (req, res) => {
    const todos = readTodos();
    const id = parseInt(req.params.id);

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: "Todo ikke funnet" });
    }

    res.json(todo);
});

// 3. POST /todos
app.post("/todos", (req, res) => {
    const todos = readTodos();

    const { title, tasks } = req.body;

    // 🔥 FIX: bedre validering + tillat tom tasks
    if (!title || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "Mangler title eller tasks" });
    }

    // 🔥 DEBUG (kan fjernes senere)
    console.log("Fikk data fra klient:", req.body);

    const newTodo = {
        id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
        title,
        tasks
    };

    todos.push(newTodo);
    writeTodos(todos);

    res.status(201).json(newTodo);
});

// ---------- Start server ----------
app.listen(PORT, () => {
    console.log(`🚀 Server kjører på http://localhost:${PORT}`);
});
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const FILE = "todos.json";

// Middleware
app.use(express.json());
app.use(express.static("public"));

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

// 1. GET /todos
app.get("/todos", (req, res) => {
    const todos = readTodos();

    const simpleList = todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        type: todo.type || "todo"
    }));

    res.json(simpleList);
});

// 2. GET /todos/:id
app.get("/todos/:id", (req, res) => {
    const todos = readTodos();
    const id = parseInt(req.params.id);

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: "Element ikke funnet" });
    }

    // Hvis gammel data mangler type, sett todo som default
    if (!todo.type) {
        todo.type = "todo";
    }

    res.json(todo);
});

// 3. POST /todos
app.post("/todos", (req, res) => {
    const todos = readTodos();

    const { type, title, tasks, content } = req.body;

    if (!type || !title) {
        return res.status(400).json({ error: "Mangler type eller title" });
    }

    const newItem = {
        id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
        type,
        title
    };

    if (type === "todo") {
        if (tasks && !Array.isArray(tasks)) {
            return res.status(400).json({ error: "Tasks må være en array" });
        }

        newItem.tasks = tasks || [];
    } else if (type === "note") {
        if (!content) {
            return res.status(400).json({ error: "Mangler content for notat" });
        }

        newItem.content = content;
    } else {
        return res.status(400).json({ error: "Ugyldig type" });
    }

    todos.push(newItem);
    writeTodos(todos);

    res.status(201).json(newItem);
});

// ---------- Start server ----------
app.listen(PORT, () => {
    console.log(`🚀 Server kjører på http://localhost:${PORT}`);
});
let tasks = [];

// Hent alle
async function getTodos() {
    const res = await fetch("/todos");
    const data = await res.json();

    const todoList = document.getElementById("todoList");
    const noteList = document.getElementById("noteList");

    todoList.innerHTML = "";
    noteList.innerHTML = "";

    const todos = data.filter(item => item.type === "todo");
    const notes = data.filter(item => item.type === "note");

    if (todos.length === 0) {
        todoList.innerHTML = `<div class="empty-text">Ingen lister enda</div>`;
    } else {
        todos.forEach(todo => {
            const div = document.createElement("div");
            div.className = "item";
            div.textContent = `☑️ ${todo.title}`;
            div.onclick = () => getTodo(todo.id);
            todoList.appendChild(div);
        });
    }

    if (notes.length === 0) {
        noteList.innerHTML = `<div class="empty-text">Ingen notater enda</div>`;
    } else {
        notes.forEach(note => {
            const div = document.createElement("div");
            div.className = "item";
            div.textContent = `📝 ${note.title}`;
            div.onclick = () => getTodo(note.id);
            noteList.appendChild(div);
        });
    }
}

// Hent én
async function getTodo(id) {
    const res = await fetch(`/todos/${id}`);
    const data = await res.json();

    document.getElementById("title").textContent = data.title;

    const tasksDiv = document.getElementById("tasks");
    tasksDiv.innerHTML = "";

    if (data.type === "todo") {
        if (!data.tasks || data.tasks.length === 0) {
            tasksDiv.innerHTML = `<div class="empty-text">Ingen oppgaver i denne listen</div>`;
            return;
        }

        data.tasks.forEach(task => {
            const div = document.createElement("div");
            div.className = "task";

            div.innerHTML = `
                <input type="checkbox" ${task.done ? "checked" : ""} disabled>
                <span>${task.text}</span>
            `;

            tasksDiv.appendChild(div);
        });
    } else if (data.type === "note") {
        const div = document.createElement("div");
        div.className = "note-view";
        div.textContent = data.content || "Tomt notat";
        tasksDiv.appendChild(div);
    }
}

// Legg til task i preview
function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) return;

    tasks.push({ text, done: false });

    const div = document.getElementById("newTasks");
    const p = document.createElement("div");
    p.className = "preview-task";
    p.textContent = `• ${text}`;
    div.appendChild(p);

    input.value = "";
}

// Lag liste
async function createTodo() {
    const title = document.getElementById("newTitle").value.trim();

    if (!title) {
        alert("Skriv tittel på listen");
        return;
    }

    const res = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "todo",
            title,
            tasks
        })
    });

    if (!res.ok) {
        alert("Feil ved lagring av liste");
        return;
    }

    resetTodoUI();
    await getTodos();
    alert("Liste opprettet!");
}

// Lag notat
async function createNote() {
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
        alert("Fyll ut tittel og notat");
        return;
    }

    const res = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "note",
            title,
            content
        })
    });

    if (!res.ok) {
        alert("Feil ved lagring av notat");
        return;
    }

    resetNoteUI();
    await getTodos();
    alert("Notat opprettet!");
}

function resetTodoUI() {
    tasks = [];
    document.getElementById("newTitle").value = "";
    document.getElementById("taskInput").value = "";
    document.getElementById("newTasks").innerHTML = "";
}

function resetNoteUI() {
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
}

getTodos();
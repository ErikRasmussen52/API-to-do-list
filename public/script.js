let tasks = [];

// Hent alle todos
async function getTodos() {
    const res = await fetch("/todos");
    const data = await res.json();

    const list = document.getElementById("todoList");
    list.innerHTML = "";

    data.forEach(todo => {
        const div = document.createElement("div");
        div.textContent = todo.title;
        div.onclick = () => getTodo(todo.id);
        list.appendChild(div);
    });
}

// Hent én todo
async function getTodo(id) {
    const res = await fetch(`/todos/${id}`);
    const data = await res.json();

    document.getElementById("title").textContent = data.title;

    const tasksDiv = document.getElementById("tasks");
    tasksDiv.innerHTML = "";

    data.tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task";

        div.innerHTML = `
            <input type="checkbox" ${task.done ? "checked" : ""}>
            <span>${task.text}</span>
        `;

        tasksDiv.appendChild(div);
    });
}

// Legg til task
function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value;

    if (!text) return;

    tasks.push({ text, done: false });

    const div = document.getElementById("newTasks");
    div.innerHTML += `<p>${text}</p>`;

    input.value = "";
}

// 🔥 FIXET createTodo
async function createTodo() {
    const title = document.getElementById("newTitle").value;

    if (!title) {
        alert("Skriv tittel");
        return;
    }

    try {
        const res = await fetch("/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                tasks: tasks || []
            })
        });

        if (!res.ok) {
            throw new Error("Feil ved lagring");
        }

        const data = await res.json();
        console.log("Opprettet:", data);

        // Reset UI
        tasks = [];
        document.getElementById("newTasks").innerHTML = "";
        document.getElementById("newTitle").value = "";
        document.getElementById("taskInput").value = "";

        // 🔥 Oppdater liste uten reload
        await getTodos();

        alert("Liste opprettet!");
    } catch (err) {
        console.error(err);
        alert("Noe gikk galt");
    }
}

// Start
getTodos();
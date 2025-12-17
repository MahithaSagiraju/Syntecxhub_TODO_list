// ----- app.js - To-Do List logic moved to a separate file -----
// Key used in localStorage
const STORAGE_KEY = 'simple_todo_tasks_v1';

// DOM references (queried at runtime)
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const todoListElement = document.getElementById('todo-list');
const emptyStateElement = document.getElementById('empty-state');
const counterElement = document.getElementById('task-counter');

// In-memory tasks array
/** @type {{id:string,text:string,completed:boolean}[]} */
let tasks = [];

function loadTasksFromStorage(){
	try{
		const raw = localStorage.getItem(STORAGE_KEY);
		if(!raw) return;
		const parsed = JSON.parse(raw);
		if(Array.isArray(parsed)) tasks = parsed;
	}catch(e){
		console.error('Could not load tasks from storage', e);
	}
}

function saveTasksToStorage(){
	try{
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	}catch(e){
		console.error('Could not save tasks to storage', e);
	}
}

function createTaskObject(text){
	return {
		id: 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6),
		text: text.trim(),
		completed: false
	};
}

function renderTasks(){
	counterElement.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
	todoListElement.innerHTML = '';
	if(tasks.length === 0){
		emptyStateElement.hidden = false;
		return;
	}
	emptyStateElement.hidden = true;

	tasks.forEach(task => {
		const li = document.createElement('li');
		li.className = 'todo-item';
		li.dataset.id = task.id;

		const left = document.createElement('div');
		left.className = 'todo-left';

		const check = document.createElement('button');
		check.className = 'checkbox';
		check.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as complete');
		check.title = task.completed ? 'Mark as incomplete' : 'Mark as complete';
		check.innerHTML = task.completed ? '✔️' : '◻️';
		check.addEventListener('click', () => toggleComplete(task.id));

		const textSpan = document.createElement('span');
		textSpan.className = 'todo-text' + (task.completed ? ' completed' : '');
		textSpan.textContent = task.text;
		textSpan.title = task.text;

		left.appendChild(check);
		left.appendChild(textSpan);

		const actions = document.createElement('div');
		actions.className = 'actions';

		const editBtn = document.createElement('button');
		editBtn.className = 'icon-button icon-edit';
		editBtn.title = 'Edit task';
		editBtn.innerHTML = '✏️';
		editBtn.addEventListener('click', () => editTask(task.id));

		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'icon-button icon-delete';
		deleteBtn.title = 'Delete task';
		deleteBtn.innerHTML = '🗑️';
		deleteBtn.addEventListener('click', () => deleteTask(task.id));

		actions.appendChild(editBtn);
		actions.appendChild(deleteBtn);

		li.appendChild(left);
		li.appendChild(actions);
		todoListElement.appendChild(li);
	});
}

function addTaskFromInput(event){
	if(event && typeof event.preventDefault === 'function') event.preventDefault();
	const text = taskInput.value;
	if(!text || !text.trim()) return;
	const newTask = createTaskObject(text);
	tasks.unshift(newTask);
	saveTasksToStorage();
	renderTasks();
	taskInput.value = '';
	taskInput.focus();
}

function toggleComplete(taskId){
	const index = tasks.findIndex(t => t.id === taskId);
	if(index === -1) return;
	tasks[index].completed = !tasks[index].completed;
	saveTasksToStorage();
	renderTasks();
}

function deleteTask(taskId){
	tasks = tasks.filter(t => t.id !== taskId);
	saveTasksToStorage();
	renderTasks();
}

function editTask(taskId){
	const index = tasks.findIndex(t => t.id === taskId);
	if(index === -1) return;
	const currentText = tasks[index].text;
	const newText = prompt('Edit task:', currentText);
	if(newText === null) return;
	if(!newText.trim()){
		if(confirm('Task is empty. Delete it?')) deleteTask(taskId);
		return;
	}
	tasks[index].text = newText.trim();
	saveTasksToStorage();
	renderTasks();
}

function init(){
	try{
		loadTasksFromStorage();
		renderTasks();
		taskForm.addEventListener('submit', addTaskFromInput);
		// Keep simple: Enter will submit the form automatically
	}catch(e){
		console.error('Initialization error', e);
	}
}

// Initialize when DOM is ready to guarantee elements exist
window.addEventListener('DOMContentLoaded', init);



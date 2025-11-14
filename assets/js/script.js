// 02-Challenge: Task Board (Unsolved Starter)
//
// Use this file to implement:
// - Task creation
// - Task rendering
// - Drag-and-drop across columns
// - Color-coding by due date using Day.js
// - Persistence with localStorage

// ===== State & Initialization =====

// Load tasks and nextId from localStorage (or use defaults)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Utility to save tasks + nextId
function saveState() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', JSON.stringify(nextId));
}

// ===== Core Functions (implement these) =====

// TODO: generateTaskId()
// - Return a unique id
// - Increment nextId and persist using saveState()
function generateTaskId() {
    // Your code here
    let id = nextId++;
    saveState();
    console.log (id);
    return id;
}

// TODO: createTaskCard(task)
// - Return a jQuery element representing a task card
// - Include:
//   - Title
//   - Description
//   - Due date
//   - Delete button
// - Add a data-task-id attribute for later lookups
// - Use Day.js to color-code:
//   - If task is not in "done":
//     - Add a warning style if due soon / today
//     - Add an overdue style if past due
function createTaskCard(task) {
    // Your code here
    //const dueDateTask = dayjs(task.dueDate, 'yy-mm-dd');
    let dueDateTask = task.dueDate;
    //console.log(`The due date is: ${dueDateTask}`);

    dueDateTask = dayjs(dueDateTask);
    //console.log(`The due date is in dayjs: ${dueDateTask}`);

    const today = dayjs();

    //console.log(`The due date is: ${dueDateTask}`);
    //console.log(`The day is: ${today}`);

    const diffDays = dueDateTask.diff(today, 'days');
    //console.log(`The difference is: ${diffDays}`);

    //Select a class according to the time and status for the card and the delete button
    let classForCard = "";
    let classForButton = "";
    if (task.status==='done') {
        classForCard = "card text-white bg-success mb-3"//Green color
        classForButton = "btn-danger";
    }
    else if (task.status==='to-do' || task.status==='in progress') {
        if (diffDays <0 ) 
            {
            classForCard = "card text-white bg-danger mb-3"//Red Color
            classForButton = "btn-outline-light";
        }
        else if (diffDays >5) {
            classForCard = "card text-dark bg-light mb-3"//Light color
            classForButton = "btn-danger";
        }
        else if (diffDays >= 0 && diffDays <=5) {
            classForCard = "card text-white bg-warning mb-3"//Orange color
            classForButton = "btn-danger";
        }
    }

    //console.log(classForButton);
    
    const $card = $(`
    <div  class="task-card ${classForCard}" data-task-id="${task.id}">
    <h5 class="card-header text-center">${task.title}</h5>
      <div class="card-body text-center"> 
        <p class="card-text">${task.description}</p>
        <p>${task.dueDate}</p>
        <button class="btn btn-sm ${classForButton} delete-task" data-task-id="${task.id}">
          Delete
        </button>
      </div>
    </div>
  `);

  //console.log("Return card");
  return $card;

}

// TODO: renderTaskList()
// - Clear all lane containers (#todo-cards, #in-progress-cards, #done-cards)
// - Loop through tasks array
// - For each task, create a card and append it to the correct lane
// - After rendering, make task cards draggable with jQuery UI
function renderTaskList() {
    // Your code here
    $("#todo-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    tasks.forEach((task, index)=> {
    //console.log(`User at index ${index}:`);
    //console.log(`ID: ${task.id}, Name: ${task.title}, Due Date: ${task.dueDate}, Description: ${task.description}, Status: ${task.status}`);

    $card = createTaskCard(task);

    
    if(task.status === "to-do") {$("#todo-cards").append($card)}
    else if (task.status === "in progress") {$("#in-progress-cards").append($card)}
    else if (task.status === "done") {$("#done-cards").append($card)}

    });

    //Drag the card
    $(".task-card").draggable({
        containment: ".container .py-4",
        stack: ".task-card",
        zIndex: 9999
    });

    $("#todo-cards").droppable({
      drop: function( event, ui ) {
        handleDrop(event, ui);
    }})   

    $("#in-progress-cards").droppable({
      drop: function( event, ui ) {
        handleDrop(event, ui);
    }})    
    
    $("#done-cards").droppable({
      drop: function( event, ui ) {
        handleDrop(event, ui);
    }})      
    


    //Call delete function with the class button
    $(".delete-task").on("click", handleDeleteTask);

    
    
}

// TODO: handleAddTask(event)
// - Prevent default form submission
// - Read values from #taskTitle, #taskDescription, #taskDueDate
// - Validate: if missing, you can show a message or just return
// - Create a new task object with:
//   - id from generateTaskId()
//   - title, description, dueDate
//   - status: 'to-do'
// - Push to tasks array, save, re-render
// - Reset the form and close the modal
function handleAddTask(event) {
    // Your code here
    event.preventDefault();
    const title = $("#taskTitle").val().trim();
    const description = $("#taskDescription").val().trim();
    const dueDate = $("#taskDueDate").val();

    if (!title || !description || !dueDate) {
        alert("Please fill out all fields before saving.");
    return;
    }


    const newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: "to-do"
    }

    tasks.push(newTask);
    saveState();
    renderTaskList();

    //Hide the modal window
    $("#taskModal").modal("hide");

    //reset the form
    $('#taskForm')[0].reset();
    return;

}

// TODO: handleDeleteTask(event)
// - Get the task id from the clicked button (data-task-id)
// - Remove that task from tasks array
// - Save and re-render
function handleDeleteTask(event) {
    // Your code here
    event.preventDefault();
    console.log(event);
    const taskId = $(event.target).data("task-id");
    console.log (`This is the index to remove: ${taskId}`);
    tasks = tasks.filter(task => task.id !== taskId);

    saveState();
    renderTaskList();
}

// TODO: handleDrop(event, ui)
// - Get the task id from the dragged card
// - Determine the new status from the lane's dataset/status or id
// - Update the task's status in the tasks array
// - Save and re-render
function handleDrop(event, ui) {
    const droppedCard = ui.draggable;
    const droppedId = droppedCard.data("task-id");
    let  laneId = $(event.target).attr("id"); // ID of the element where it was dropped
    console.log(laneId);

    let newStatus;
    if (laneId === "todo-cards") newStatus = "to-do";
    else if (laneId === "in-progress-cards") newStatus = "in progress";
    else if (laneId === "done-cards") newStatus = "done";

    console.log(newStatus);

    const taskToChange = tasks.find(task => task.id === droppedId);
    console.log(taskToChange); 

    taskToChange.status = newStatus;
    console.log(taskToChange); 

    saveState();
    renderTaskList();
}

// ===== Document Ready =====

$(function () {
    // Show current date in header using Day.js
    $('#current-date').text(dayjs().format('[Today:] dddd, MMM D, YYYY'));

    // Initialize datepicker for due date
    // Hint: keep format consistent and use it in your parsing
    $('#taskDueDate').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        
    });

    // Render tasks on load (will do nothing until you implement renderTaskList)
    renderTaskList();

    // Form submit handler
    $('#taskForm').on('submit', handleAddTask);

    // Make lanes droppable
    // TODO: configure droppable to accept task cards and use handleDrop
    $('.lane-body').droppable({
        // accept: '.task-card',
        // drop: handleDrop,
    });
});

// NOTE:
// - You are encouraged to use Day.js for ALL date logic.
// - You may adjust “due soon” rules, as long as they’re clearly implemented.

/**
 * 
 * @authors Robert Hazler (rehazler@gmail.com)
 * @date    2018-09-06
 * @version 0.1.0
 */



////////////////
//Constructors//
////////////////

//toDoID, toDoTitle, toDoDescrption, toDoPriority, dueDate, toDoStatus
function Task(toDoID, toDoTitle, toDoDescrption = "", toDoPriority = 0, dueDate = new Date(), toDoStatus = "In Progress")
{
	this.to_do_id = toDoID;
	this.to_do_title = toDoTitle; 
	this.to_do_descrption = toDoDescrption; 
	this.to_do_priority = toDoPriority;
	this.due_date = dueDate;
	this.to_do_status = toDoStatus;
}


/////////////
//Functions//
/////////////

//Initalize storage, existing stored items if they exist, and adds event listeners on page load.
function initializePage()
{
	//////////////////
	//Client Storage//
	//////////////////

	//If local storage has items in it get them and parse them as json else store empty array.
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	let totalTasksCount = localStorage.getItem("totalTasks") ? JSON.parse(localStorage.getItem("totalTasks")) : 0;

	//Set localstorage to currently stored info
	localStorage.setItem("tasks", JSON.stringify(tasksArray));
	localStorage.setItem("totalTasks", totalTasksCount);

	//Parse each item from local storage
	const data = JSON.parse(localStorage.getItem("tasks"));

	// Loop through each stored item in the localstorage and recreate it on refresh/reload
	data.forEach(task => {
		liCreator(["toDoListItem"], task["to_do_title"], task["to_do_id"]);
	});

	////////////////
	//DOM Elements//
	////////////////

	let toDolist = document.querySelector("#toDoUL");
	let toDoForm = document.forms.toDoCreationForm;
	// Get the modal
	let modal = document.querySelector("#myModal");
	//Modal content
	let modalText = document.querySelectorAll(".modalText")[0];
	// Get the <span> element that closes the modal
	let spanClose = document.querySelectorAll(".close")[0];


	///////////////////
	//Event Listeners//
	///////////////////

	// When user hit"s submit, add item in input to list.
	toDoForm.addEventListener("submit", event =>
	{
		event.preventDefault();

		if(event.target.toDoInput.value.trim())
		{
			localStorage.setItem("totalTasks",  ++totalTasksCount );
			const task = new Task(`task${totalTasksCount}`, event.target.toDoInput.value);
			storeTasks(task);
			liCreator(["toDoListItem"], event.target.toDoInput.value, task["to_do_id"]);
		}
		else
		{
			alert("Invalid input, try again");
		}

		toDoForm.reset();
	});

	// When user clicks a list item, pop up a modal for that list item
	toDolist.addEventListener("click", event => 
	{
		// If the user clicks an li
		if(event.target && event.target.nodeName == "LI") {
			let deleteButton = createHTMLElement("button", "Delete", ["delete_button"]);
			let taskID = event.target.id;
			modalText.appendChild(createHTMLElement("p", `${taskID} was clicked. \n${event.target.textContent}`));
			modalText.appendChild(deleteButton);
			modal.style.display = "block";

			//Delete task button
			//Removes the task from the list, form memory, and removes the event listener that is created when the modal is opened
			deleteButton.addEventListener("click", function removeTask(){
				if(confirm(`The event "${event.target.textContent}" will be gone forever. Is this ok?`))
				{
					let targetedListItem = document.querySelector(`#${taskID}`);
					let taskArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
					toDolist.removeChild(targetedListItem);
					removeTaskFromMemory(taskArray, taskID);
					deleteButton.removeEventListener("click", removeTask);
					modalText.textContent = "";
					modal.style.display = "none";
				}
			});
		}
	});


	// When the user clicks on <span> (x), close the modal
	spanClose.addEventListener("click", () =>
	{ 
		modalText.textContent = "";
		modal.style.display = "none";
	});

	// When the user clicks anywhere outside of the modal, close it
	window.addEventListener("click", event => 
	{
		if (event.target == modal) {
			modalText.textContent = "";
			modal.style.display = "none";
		}
	});
}

//Returns the number of tasks that exist in the localStorage
function taskCounter()
{
	return JSON.parse(localStorage.getItem("tasks")).length;
}

//Creates and returns a HTML element
function createHTMLElement(elementType, text="", classArray=[]) 
{
	let newElement = document.createElement(elementType);
	if(text != "")
	{
		newElement.textContent = text;
	}

	for(let i = 0; i < classArray.length; i++) {
		newElement.classList.add(classArray[i]);
	}

	return newElement;
}


//Creates a li element for the list and appends it. Does not return the element. 
//If return is necessary create an li using the createHTMLElement function.
function liCreator(classArray, itemText, itemID) 
{
	let toDolist = document.querySelector("#toDoUL");

	let newToDoItem = document.createElement("li");
	newToDoItem.textContent = itemText;

	for(let i = 0; i < classArray.length; i++) {
		newToDoItem.classList.add(classArray[i]);
	}

	newToDoItem.setAttribute("id", itemID);


	toDolist.appendChild(newToDoItem);
}

//Stores tasks in localStorage
function storeTasks(taskObject) 
{
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	tasksArray.push(taskObject);
	localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

function removeTaskFromMemory(taskArray, taskID)
{
	taskArray = taskArray.filter(function( task ) {
		return task.to_do_id !== taskID;
	});

	localStorage.setItem("tasks", JSON.stringify(taskArray));
}


//Needs to be reworked to fill in modal information and inputs
// function populateModal()
// {

// }




initializePage();
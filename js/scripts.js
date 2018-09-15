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
		liCreator(task["to_do_title"], task["to_do_id"], task["to_do_status"]);
	});

	////////////////
	//DOM Elements//
	////////////////

	let toDoList = document.querySelector("#toDoUL");
	let doneList = document.querySelector("#doneUL");
	let toDoForm = document.forms.toDoCreationForm;


	///////////////////
	//Event Listeners//
	///////////////////

	toDoList.addEventListener("change", event => 
	{
		let checkedListItem = event.target.closest(".to-do-list-item");
		let checkedListItemID = checkedListItem.id;

		if(event.target.checked){
			timer.push({checkedListItemID:setTimeout(moveTaskToDoneList, 2000, checkedListItemID, event.target)});
			console.log(timer);
		}
		else
		{
			//Clear timeout for moving task to done list.
			clearTimeout(timer[checkedListItem.id]);
		}
	});

	// When user hit"s submit, add item in input to list.
	toDoForm.addEventListener("submit", event =>
	{
		event.preventDefault();

		if(event.target.toDoInput.value.trim())
		{
			localStorage.setItem("totalTasks",  ++totalTasksCount );
			const task = new Task(`task${totalTasksCount}`, event.target.toDoInput.value);
			storeTasks(task);
			liCreator(event.target.toDoInput.value, task["to_do_id"], "In Progress");
		}
		else
		{
			alert("Invalid input, try again");
		}

		toDoForm.reset();
	});

	// When user clicks a list item, pop up a modal for that list item
	toDoList.addEventListener("click", populateModal.bind(event));
	doneList.addEventListener("click", populateModal.bind(event)); 
}

function moveTaskToDoneList(taskID, targetElement)
{
	//Safe guard to double check that the item is checked in case the user were to spam click the checkbox or
	//accidentally uncheck the box right before the transfer from to do to completed.
	if(targetElement.checked)
	{
		let completedTask = targetElement.closest(".to-do-list-item");
		modifyTasks(taskID);
		completedTask.classList.remove("to-do-list-item");
		completedTask.parentNode.removeChild(completedTask);
		liCreator(completedTask.textContent, completedTask.id, "Done", completedTask.classList);
		timer.splice(taskID,1);
	}
	
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
function liCreator(itemText, itemID, toDoStatus, classArray=[]) 
{
	let list;	
	let newToDoItem = document.createElement("li");

	newToDoItem.textContent = itemText;

	for(let i = 0; i < classArray.length; i++) {
		newToDoItem.classList.add(classArray[i]);
	}
	newToDoItem.setAttribute("id", itemID);


	if(toDoStatus === "In Progress")
	{

		newToDoItem.classList.add("to-do-list-item");
		list = document.querySelector("#toDoUL");
		list.appendChild(newToDoItem);
		checkboxCreator(itemID);
	}
	else
	{
		newToDoItem.classList.add("done-list-item");
		list = document.querySelector("#doneUL");
		list.appendChild(newToDoItem);
	}
}

//Creates a checkbox for each list item
function checkboxCreator(itemID) 
{
	let toDoItem = document.querySelector(`#${itemID}`);
	let newCheckboxContainer = createHTMLElement("label","",["checkbox-container"]);
	let newCheckbox = createHTMLElement("input","",["checkbox"]);
	let newCheckboxCheckmark = createHTMLElement("span","",["checkmark"]);

	newCheckbox.setAttribute("type", "checkbox");

	toDoItem.insertBefore(newCheckboxContainer, toDoItem.firstChild);
	newCheckboxContainer.appendChild(newCheckbox);
	newCheckboxContainer.appendChild(newCheckboxCheckmark);
}


//Stores tasks in localStorage
function storeTasks(taskObject) 
{
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	tasksArray.push(taskObject);
	localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

//Stores tasks in localStorage
function modifyTasks(taskID) 
{
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	let targetTask;
	tasksArray = tasksArray.filter(function( task ) {
		if(task.to_do_id === taskID)
		{
			task.to_do_status = "Complete";
			targetTask = task;
		}

		return task;
	});

	localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

function removeTaskFromMemory(tasksArray, taskID)
{
	tasksArray = tasksArray.filter(function( task ) {
		return task.to_do_id !== taskID;
	});

	localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

function modalToggle(modalText)
{
	let modal = document.querySelector("#myModal");
	if(modal.classList.contains("hidden"))
	{
		modal.classList.remove("hidden");
	}
	else
	{
		modal.classList.add("hidden");
		modalText.textContent = "";
	}
}

//Needs to be reworked to fill in modal information and inputs
function populateModal(event)
{
	// Get the modal
	let modal = document.querySelector("#myModal");
	//Modal content
	let modalText = document.querySelectorAll(".modal-text")[0];
	// Get the <span> element that closes the modal
	let spanClose = document.querySelectorAll(".close")[0];
	let list = event.target.closest("UL");

	// If the user clicks an li
	if(event.target && event.target.nodeName == "LI") {
		let deleteButton = createHTMLElement("button", "Delete", ["delete-button"]);
		let taskID = event.target.id;
		modalText.appendChild(createHTMLElement("p", `${taskID} was clicked. \n${event.target.textContent}`));
		modalText.appendChild(deleteButton);
		modalToggle(modalText);

		//Delete task button
		//Removes the task from the list, form memory, and removes the event listener that is created when the modal is opened
		deleteButton.addEventListener("click", function removeTask(){
			if(confirm(`The event "${event.target.textContent}" will be gone forever. Is this ok?`))
			{
				let targetedListItem = document.querySelector(`#${taskID}`);
				let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
				list.removeChild(targetedListItem);
				removeTaskFromMemory(tasksArray, taskID);
				deleteButton.removeEventListener("click", removeTask);
				modalToggle(modalText);
			}
		});

		// When the user clicks on <span> (x), close the modal
		spanClose.addEventListener("click", function closeSpanModal()
		{ 
			modalText.textContent = "";
			modalToggle(modalText);
			spanClose.removeEventListener("click", closeSpanModal);
		});
		// When the user clicks anywhere outside of the modal, close it
		window.addEventListener("click", function closeWindowModal(event) 
		{
			if (event.target == modal) {
				modalToggle(modalText);
				window.removeEventListener("click", closeWindowModal);
			}
		});
	}
}




initializePage();
let timer = new Array();
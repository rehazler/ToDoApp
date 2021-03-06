/**
 * 
 * @authors Robert Hazler (rehazler@gmail.com)
 * @date    2018-09-06
 * @version 0.1.0
 */



////////////////
//Constructors//
////////////////

//toDoID, toDoTitle, toDoDescription, toDoPriority, dueDate, toDoStatus
function Task(toDoID, toDoTitle, toDoDescription = "", toDoPriority = 1, toDoDueDate = "No set date", toDoStatus = "In Progress")
{
	this.to_do_id = toDoID;
	this.to_do_title = toDoTitle; 
	this.to_do_description = toDoDescription; 
	this.to_do_priority = toDoPriority;
	this.to_do_due_date = toDoDueDate;
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

	let inProgressTaskExists = buildList();

	////////////////
	//DOM Elements//
	////////////////

	let toDoList = document.querySelector("#toDoUL");
	let toDoListDiv = document.querySelector("#toDoListDiv");
	let doneList = document.querySelector("#doneUL");
	let doneListDiv = document.querySelector("#doneListDiv");
	let toDoForm = document.forms.toDoCreationForm;
	let displayDoneButton = document.querySelector(".display-done");
	let dumpListButton = document.querySelector(".dump-list");
	let deleteMemoryButton = document.querySelector(".delete-all");

	if(inProgressTaskExists && toDoListDiv.classList.contains("hidden"))
	{
		toDoListDiv.classList.remove("hidden");
	}


	///////////////////
	//Event Listeners//
	///////////////////

	toDoList.addEventListener("change", event => 
	{
		let checkedListItem = event.target.closest(".to-do-list-item");
		let checkedListItemID = checkedListItem.id;

		if(event.target.checked){
			timer.push({checkedListItemID:setTimeout(moveTaskToDoneList, 2000, checkedListItemID, event)});
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
			if(toDoListDiv.classList.contains("hidden"))
			{
				toDoListDiv.classList.remove("hidden");
			}

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

	//Control Panel
	displayDoneButton.addEventListener("click", doneListToggle.bind(event));
	dumpListButton.addEventListener("click", () => 
	{
		tasksArray = JSON.parse(localStorage.getItem("tasks"));
		if(confirm("Are you sure? This will DELETE your to do list then print your to do list in the console."))
		{
			tasksArray = tasksArray.filter(function( task ) {
				if(task.to_do_status === "In Progress")
				{
					//console.log left intetionally. This is meant to output existing to do tasks to the console
					//for the user if they wish.
					console.log(task);
					toDoList.textContent = "";
					toDoListDiv.classList.add("hidden");
				}
				else
				{
					return task;
				}
			});
			localStorage.setItem("tasks", JSON.stringify(tasksArray));
		}
	});

	deleteMemoryButton.addEventListener("click", () =>
	{
		if(confirm("Are you sure? This will restore everything to default and DELETE ALL lists and information!"))
		{
			localStorage.clear();
			tasksArray = new Array();
			totalTasksCount = 0;
			localStorage.setItem("tasks", JSON.stringify(tasksArray));
			localStorage.setItem("totalTasks", totalTasksCount);
			toDoList.textContent = "";
			doneList.textContent = "";
			toDoListDiv.classList.add("hidden");
			doneListDiv.classList.add("hidden");
		}
	});
}

function buildList()
{
	
	//Parse each item from local storage
	const data = JSON.parse(localStorage.getItem("tasks"));
	let toDoList = document.querySelector("#toDoUL");
	let doneList = document.querySelector("#doneUL");
	let twentyFourHours = (60 * 60 * 24 * 1000);
	let now = new Date();
	let inProgressTaskExists = false;

	if(toDoList.hasChildNodes() || doneList.hasChildNodes())
	{
		toDoList.textContent = "";
		doneList.textContent = "";
	}

	//Sort the data by priority. 5 being highest priority and 1 being lowest
	data.sort(function(priorityA, priorityB){
		return priorityB.to_do_priority - priorityA.to_do_priority;
	});

	// Loop through each stored item in the localstorage and recreate it on refresh/reload
	data.forEach(task => {
		if(task["to_do_status"] === "In Progress")
		{
			inProgressTaskExists = true;
			let dueDate = task["to_do_due_date"];
			if(dueDate !== "No set date" && (new Date(dueDate) - now) < twentyFourHours)
			{
				liCreator(task["to_do_title"], task["to_do_id"], task["to_do_status"], ["approaching-due-date"]);
				return;
			}
		}
		liCreator(task["to_do_title"], task["to_do_id"], task["to_do_status"]);
	});

	return inProgressTaskExists;
}

function moveTaskToDoneList(taskID, event)
{
	//Safe guard to double check that the item is checked in case the user were to spam click the checkbox or
	//accidentally uncheck the box right before the transfer from to do to completed.
	if(event.target.checked)
	{
		let completedTask = event.target.closest(".to-do-list-item");
		//Make sure that a parent node exists prior to moving the completed task
		//The parent node would likely be missing if the user attempted to complete
		//the task but deleted it before it was moved.
		if(completedTask.parentNode !== null)
		{
			modifyTasks(getTaskIndex(taskID), "Complete");
			completedTask.classList.remove("to-do-list-item");
			completedTask.parentNode.removeChild(completedTask);
			liCreator(completedTask.textContent, completedTask.id, "Done", completedTask.classList);
			timer.splice(taskID,1);
			doneListToggle(event);
		}
	}
	
}

function doneListToggle(event)
{
	let doneListDiv = document.querySelector("#doneListDiv");
	let doneList = document.querySelector(".done-list");

	if(doneListDiv.classList.contains("hidden"))
	{
		if(doneList.hasChildNodes())
		{
			doneListDiv.classList.remove("hidden");
			if(event.target.nodeName !== "BUTTON")
			{
				setTimeout(doneListToggle, 10000, "no event");
			}
		}
		else
		{
			alert("You have no completed tasks.");
		}
	}
	else
	{
		//If "no event" is sent, this means that this function was called by the timeout and not by user action.
		//If the button is pressed, this means the user has chosen to toggle the done list.
		//By doing it this way, it prevents the done list from being closed by sending an item to the done list while
		//it is toggled on by the button.
		if(event === "no event" || event.target.nodeName === "BUTTON")
		{
			doneListDiv.classList.add("hidden");
		}
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

	//If element type is a form then the text argument will be used to create the ID
	//rather than setting it to the elements textContent;
	if(elementType === "form")
	{
		newElement.setAttribute("method", "post");
		newElement.setAttribute("id", `${text}Form`);
		newElement.setAttribute("action", "index.html");
	}
	//If element isn't a form and the text is set, the text content of the element
	//will be set to the text argument
	else if(text !== "")
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
	let liTextContainer = document.createElement("span");

	liTextContainer.textContent = itemText;
	newToDoItem.appendChild(liTextContainer);

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

function labelCreator(text, classArray=[]) 
{
	let newLabel = document.createElement("label");
	
	text = text.split("_").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
	newLabel.textContent = text;
	for(let i = 0; i < classArray.length; i++) {
		newLabel.classList.add(classArray[i]);
	}
	return newLabel;
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
function modifyTasks(taskIndex, modificationType, form = "") 
{
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];

	if(typeof tasksArray[taskIndex] !== "undefined")
	{
		switch (modificationType)
		{
		case "Complete":
			tasksArray[taskIndex].to_do_status = "Complete";
			break;

		case "Edit":
			//Change the title in the list item's span
			tasksArray[taskIndex].to_do_title = form.titleInput.value;
			tasksArray[taskIndex].to_do_description = form.descriptionInput.value;
			tasksArray[taskIndex].to_do_priority = parseInt(form.priorityInput.value);
			if(form.dueDateInput.value !== "")
			{
				tasksArray[taskIndex].to_do_due_date = new Date(`${form.dueDateInput.value} ${form.dueTimeInput.value}`);
			} 

			break;
		}
		localStorage.setItem("tasks", JSON.stringify(tasksArray));
	}
}

function removeTaskFromMemory(tasksArray, taskID)
{
	tasksArray = tasksArray.filter(function( task ) {
		return task.to_do_id !== taskID;
	});

	localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

function modalToggle()
{
	let modal = document.querySelector("#myModal");
	let modalContent = document.querySelector(".modal-content");
	let modalText = document.querySelector(".modal-text");
	let editForm = document.forms.editForm ? document.forms.editForm : "";

	if(modal.classList.contains("hidden"))
	{
		modal.classList.remove("hidden");
	}
	else
	{
		modal.classList.add("hidden");
		modalText.textContent = "";
		modalContent.appendChild(modalText);
		if(editForm !== "")
		{
			editForm.textContent = "";
			modalContent.removeChild(editForm);
		}
	}
}

function getTaskIndex(taskID)
{
	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	for(let index = 0; index < tasksArray.length; index++)
	{
		if(tasksArray[index].to_do_id === taskID)
		{
			return index;
		}
	}
}

function populateEditModal(taskID, taskElementArray)
{
	let taskIndex = getTaskIndex(taskID);
	let taskToEdit = JSON.parse(localStorage.getItem("tasks"))[taskIndex];
	let dueDate = new Date(taskToEdit.to_do_due_date);

	let modal = document.querySelector(".modal-text");
	let editForm = createHTMLElement("form", "edit");
	let submitButton = createHTMLElement("input", "Submit", ["input", "edit-button"]);
	let titleInput = createHTMLElement("input", "Title", ["input", "modal-input-spacing"]);
	let descriptionInput = createHTMLElement("textarea", "Description", ["description-input", "modal-input-spacing"]);
	let priorityInput  = createHTMLElement("input", "Priority", ["due-date-input", "modal-input-spacing"]);
	let dueDateInput = createHTMLElement("input", "Due Date", ["due-date-input", "modal-input-spacing"]);
	let dueTimeInput = createHTMLElement("input", "Due Time", ["due-time-input", "modal-input-spacing"]);

	titleInput.setAttribute("type", "text");
	titleInput.setAttribute("value", taskToEdit.to_do_title);
	titleInput.setAttribute("id", "titleInput");
	modal.insertBefore(titleInput, taskElementArray[0].nextSibling);
	modal.insertBefore(document.createElement("br"), titleInput.nextSibling);

	descriptionInput.textContent = taskToEdit.to_do_description;
	descriptionInput.setAttribute("value", taskToEdit.to_do_description);
	descriptionInput.setAttribute("id", "descriptionInput");
	modal.insertBefore(descriptionInput, taskElementArray[1].nextSibling);
	modal.insertBefore(document.createElement("br"), descriptionInput.nextSibling);

	priorityInput.setAttribute("type", "number");
	priorityInput.setAttribute("value", taskToEdit.to_do_priority);
	priorityInput.setAttribute("min", 1);
	priorityInput.setAttribute("max", 5);
	priorityInput.setAttribute("id", "priorityInput");
	modal.insertBefore(priorityInput, taskElementArray[2].nextSibling);
	modal.insertBefore(document.createElement("br"), priorityInput.nextSibling);

	dueDateInput.setAttribute("type", "date");
	dueDateInput.setAttribute("id", "dueDateInput");
	dueDateInput.setAttribute("value", formatDate(dueDate, "Date"));
	modal.insertBefore(dueDateInput, taskElementArray[3].nextSibling);

	dueTimeInput.setAttribute("type", "time");
	dueTimeInput.setAttribute("id", "dueTimeInput");
	dueTimeInput.setAttribute("value", formatDate(dueDate, "Time"));
	modal.insertBefore(dueTimeInput, dueDateInput.nextSibling);
	modal.insertBefore(document.createElement("br"), dueTimeInput.nextSibling);

	modal.parentNode.insertBefore(editForm, modal);
	editForm.appendChild(modal);

	submitButton.setAttribute("type", "submit");
	submitButton.setAttribute("value", "Submit");
	submitButton.setAttribute("id", "editSubmit");
	editForm.appendChild(submitButton);

	editForm.addEventListener("submit", function editTask()
	{
		event.preventDefault();
		
		if(confirm("Do you want to submit these task changes?"))
		{
			modifyTasks(taskIndex, "Edit", event.target);
			buildList();
			modalToggle();
			editForm.addEventListener("submit",editTask);
		}
	});
}

function formatDate(date, dateOrTime ="") {
	if(date instanceof Date && !isNaN(date))
	{
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let ampm = hours >= 12 ? "pm" : "am";
		let month = date.getMonth() + 1
		let day = date.getDate();
		let year = date.getFullYear();

		month = month < 10 ? `0${month}` : month;
		minutes = minutes < 10 ? `0${minutes}` : minutes;

		if(dateOrTime === "Time")
		{
			hours = hours < 10 ? `0${hours}` : hours;
			return `${hours}:${minutes}`;

		}
		else if(dateOrTime === "Date")
		{
			return `${year}-${month}-${day}`;
		}
		else
		{
			hours = hours % 12;
			hours = hours ? hours : 12; 
			return `${month}/${day}/${year} at ${hours}:${minutes} ${ampm}`;
		}
	}

	return "No set date";
}


function closeModalEvent(event)
{ 
	let modal = document.querySelector("#myModal");
	let spanClose = document.querySelectorAll(".close")[0];

	if (event.target === modal) {
		modalToggle();
		window.removeEventListener("click", closeModalEvent, event);
		spanClose.removeEventListener("click", closeModalEvent, event);
	}
	else if (event.target === spanClose)
	{
		modalToggle();
		spanClose.removeEventListener("click", closeModalEvent, event);
		window.removeEventListener("click", closeModalEvent, event);
	}
	
}


//Needs to be reworked to fill in modal information and inputs
function populateModal(event)
{
	// If the user clicks an li
	if(event.target && !event.target.classList.contains("checkmark") && (event.target.nodeName == "LI" || event.target.nodeName == "SPAN")) 
	{
		//Modal content
		let modalText = document.querySelectorAll(".modal-text")[0];
		// Get the <span> element that closes the modal
		let spanClose = document.querySelectorAll(".close")[0];
		let list = event.target.closest("UL");
		let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];

		let taskID = event.target.id.includes("task") ? event.target.id : event.target.parentNode.id;
		let targetTask = tasksArray[getTaskIndex(taskID)];
		let deleteButton = createHTMLElement("button", "Delete", ["delete-button"]);
		let targetTaskArray = new Array();
		let elementText = "";

		for(let key in targetTask)
		{
			//We check this to prevent printing out the to do's id as it is not necessary
			if(key !== "to_do_id")
			{
				elementText = key !== "to_do_due_date" ? targetTask[key] : formatDate(new Date(targetTask[key]));
				let newElement = createHTMLElement("p", elementText, ["modal-task-attributes"]);
				modalText.appendChild(newElement);
				targetTaskArray.push(newElement);
				modalText.insertBefore(labelCreator(key, ["modal-task-label"]), newElement);
			}
		}
		
		modalToggle();

		if(!event.target.classList.contains("done-list-item"))
		{
			let editButton = createHTMLElement("button", "Edit", ["edit-button"]);
			modalText.appendChild(editButton);

			editButton.addEventListener("click", function editTask()
			{
				modalText.removeChild(editButton);
				modalText.removeChild(deleteButton);
				populateEditModal(taskID, targetTaskArray);
				editButton.removeEventListener("click", editTask);
				
			});
		}

		modalText.appendChild(deleteButton);

		//Delete task button
		//Removes the task from the list, form memory, and removes the event listener that is created when the modal is opened
		deleteButton.addEventListener("click", function removeTask()
		{
			if(confirm(`The event "${event.target.textContent}" will be gone forever. Is this ok?`))
			{
				let targetedListItem = document.querySelector(`#${taskID}`);
				list.removeChild(targetedListItem);
				removeTaskFromMemory(tasksArray, taskID);
				deleteButton.removeEventListener("click", removeTask);
				modalToggle();
			}
		});


		// When the user clicks on <span> (x), close the modal
		spanClose.addEventListener("click",closeModalEvent, event);
		// When the user clicks anywhere outside of the modal, close it
		window.addEventListener("click", closeModalEvent, event);
		
	}
}




initializePage();
let timer = new Array();
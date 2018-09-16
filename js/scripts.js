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
function Task(toDoID, toDoTitle, toDoDescription = "", toDoPriority = 1, toDoDueDate = new Date(), toDoStatus = "In Progress")
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
		modifyTasks(getTaskIndex(taskID), "Complete");
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
	let span = document.createElement("span");

	span.textContent = itemText;
	newToDoItem.appendChild(span);

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
	let taskElement;

	switch (modificationType)
	{
	case "Complete":
		tasksArray[taskIndex].to_do_status = "Complete";
		break;

	case "Edit":
		taskElement = document.querySelector(`#${tasksArray[taskIndex].to_do_id}`);
		//Change the title in the list item's span
		taskElement.childNodes[1].textContent = form.titleInput.value;
		tasksArray[taskIndex].to_do_title = form.titleInput.value;
		tasksArray[taskIndex].to_do_description = form.descriptionInput.value;
		tasksArray[taskIndex].to_do_priority = form.priorityInput.value;
		tasksArray[taskIndex].to_do_due_date = new Date(`${form.dueDateInput.value} ${form.dueTimeInput.value}`);

		break;
	}
	

	localStorage.setItem("tasks", JSON.stringify(tasksArray));
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
	modal.insertBefore(dueDateInput, taskElementArray[3].nextSibling);

	dueTimeInput.setAttribute("type", "time");
	dueTimeInput.setAttribute("id", "dueTimeInput");
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
			modalToggle();
			editForm.addEventListener("submit",editTask);
		}
	});
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

	let tasksArray = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
	let taskID = event.target.id;
	let targetTask = tasksArray[getTaskIndex(taskID)];

	// If the user clicks an li
	if(event.target && event.target.nodeName == "LI") {
		let deleteButton = createHTMLElement("button", "Delete", ["delete-button"]);
		let editButton = createHTMLElement("button", "Edit", ["edit-button"]);
		
		let targetTaskArray = new Array();
		for(let key in targetTask)
		{
			if(key !== "to_do_id")
			{
				let newElement = createHTMLElement("p", targetTask[key], ["modal-task-attributes"]);
				modalText.appendChild(newElement);
				targetTaskArray.push(newElement);
				modalText.insertBefore(labelCreator(key, ["modal-task-label"]), newElement);
			}
		}
		
		modalToggle();

		modalText.appendChild(editButton);
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

		editButton.addEventListener("click", function editTask()
		{
			modalText.removeChild(editButton);
			modalText.removeChild(deleteButton);
			populateEditModal(taskID, targetTaskArray);
			editButton.removeEventListener("click", editTask);
			
		});

		// When the user clicks on <span> (x), close the modal
		spanClose.addEventListener("click", function closeSpanModal()
		{ 
			modalToggle();
			spanClose.removeEventListener("click", closeSpanModal);
		});
		// When the user clicks anywhere outside of the modal, close it
		window.addEventListener("click", function closeWindowModal(event) 
		{
			if (event.target == modal) {
				modalToggle();
				window.removeEventListener("click", closeWindowModal);
			}
		});
	}
}




initializePage();
let timer = new Array();
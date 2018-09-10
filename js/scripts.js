/**
 * 
 * @authors Robert Hazler (rehazler@gmail.com)
 * @date    2018-09-06
 * @version 0.1.0
 */

/////////////
//Functions//
/////////////

function createElement(elementType, text="") {
	let newElement = document.createElement(elementType);
	if(text != "")
	{
		newElement.textContent = text;
	}
	return newElement;
}

function createLi(classArray, itemText) {
	let newToDoItem = document.createElement("li");
	newToDoItem.textContent = itemText;

	for(let i = 0; i < classArray.length; i++) {
		newToDoItem.classList.add(classArray[i]);
	}

	newToDoItem.setAttribute("id", `toDoListItem${toDolist.childElementCount + 1}`);

	toDolist.appendChild(newToDoItem);
}



////////////////
//DOM Elements//
////////////////

let toDolist = document.querySelector("#toDoUL");
let toDoForm = document.forms.toDoCreationForm;
// Get the modal
let modal = document.querySelector("#myModal");
//Modal content
let modalContent = document.querySelector(".modalContent");
// Get the <span> element that closes the modal
let spanClose = document.querySelectorAll(".close")[0];



///////////////////
//Event Listeners//
///////////////////

// When user hit's submit, add item in input to list.
toDoForm.addEventListener("submit", event =>
{
	event.preventDefault();

	if(event.target.toDoInput.value.trim())
	{
		createLi(["toDoListItem"], event.target.toDoInput.value);
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
	if(event.target && event.target.nodeName == "LI") {
		modalContent.appendChild(createElement("p", `${event.target.id} was clicked. \n${event.target.textContent}`));
		modal.style.display = "block";
	}
});

// When the user clicks on <span> (x), close the modal
spanClose.addEventListener("click", () =>
{ 
	modalContent.textContent = "";
	modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", event => 
{
	if (event.target == modal) {
		modalContent.textContent = "";
		modal.style.display = "none";
	}
});
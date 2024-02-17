document.addEventListener('DOMContentLoaded', (event) => {
  // Element references
  const mainContainer = document.querySelector(".main-container");
  const sidePanelToggle = document.querySelector(".side-panel-toggle");
  const sidePanel = document.querySelector(".side-panel");
  const addButton = document.getElementById('add');
  const searchButton = document.getElementById('search');
  const selectedTableBody = document.querySelector('.selected-table tbody');
  const wrapper = document.querySelector(".wrapper");
  const animatedBorder = document.querySelector('.animated-border');
  
  // Function to adjust the side panel's position based on the main container's scroll position
  function adjustPanelPosition() {
    let newTopPosition = mainContainer.scrollTop;
    sidePanel.style.top = `${newTopPosition}px`;
    sidePanelToggle.style.top = `${newTopPosition + 20}px`;

    // Check if the animated border is currently displayed (i.e., has the 'animate' class)
    if(animatedBorder.classList.contains('animate')) {
      // Adjust the animated border's position to match the side-panel-toggle's position
      // You might need to adjust the '20px' offset based on your design
      adjustAnimatedBorderPosition();
    }
  }

  // Scroll event listener for the main container
  mainContainer.addEventListener('scroll', adjustPanelPosition);

  // Click event listener for the side panel toggle
  if (sidePanelToggle) {
    sidePanelToggle.addEventListener("click", () => {
      wrapper.classList.toggle("side-panel-open");
      animatedBorder.classList.remove('animate');
    });
  }

  // Click event listener for the search button
  if (searchButton) {
    searchButton.addEventListener('click', handleSearchButtonClick);
  }

  // Click event listener for the add button
  if (addButton) {
    addButton.addEventListener('click', handleAddButtonClick);
  }

  function handleSearchButtonClick(event) {
    event.preventDefault();
    const bloomsLevelValue = document.getElementById('blooms_level_dropdown').value;
    const subjectValue = document.getElementById('subject_dropdown').value;
    const topicValue = document.getElementById('topic_dropdown').value;
    const trainingLevelValue = document.getElementById('training_level_dropdown').value;
    const questionTypeValue = document.getElementById('question_type_dropdown').value;
    const questionDifficultyValue = document.getElementById('question_difficulty_dropdown').value;
    const questionMaxPointValue = document.getElementById('question_max_points_input').value;
    
    // Instead, get a reference to the input element itself
    const questionMaxPointsInput = document.getElementById('question_max_points_input');
    questionMaxPointsInput.classList.remove('error');

    // Now, you can perform checks and manipulate the element as needed
    if (!questionMaxPointsInput.checkValidity()) {
      questionMaxPointsInput.classList.add('error'); // Visually indicate an issue
      questionMaxPointsInput.reportValidity(); // Show the browser's validation message
      return; // Prevent further action until the input is valid
    }

    const formData = {
      blooms_levels: bloomsLevelValue !== "all" ? [bloomsLevelValue] : [],
      subjects: subjectValue !== "all" ? [subjectValue] : [],
      topics: topicValue !== "all" ? [topicValue] : [],
      question_types: questionTypeValue !== "all" ? [questionTypeValue] : [],
      question_difficulties: questionDifficultyValue !== "all" ? [questionDifficultyValue] : [],
      question_max_points: questionMaxPointValue,
      training_level: trainingLevelValue !== "all" ? trainingLevelValue : undefined,
      test_type: "manual"
    };

    fetch('/get-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      const resultsTable = document.querySelector(".results-table");
      const tableBody = resultsTable.querySelector("tbody");
      tableBody.innerHTML = "";

      if (typeof data.total_questions_in_pool !== 'undefined' && data.selected_questions) {
        data.selected_questions.forEach(function(question) {
          const row = tableBody.insertRow();
          const cell1 = row.insertCell(0);
          const cell2 = row.insertCell(1);
          const cell3 = row.insertCell(2);
        
          cell1.textContent = question.max_points;
          cell2.textContent = question.question_text;
          cell3.innerHTML = '<input type="checkbox" name="select_question" value="' + question.question_id + '">';
        });
      } else if (data.total_questions_in_pool === 0) {
        alert(data.message || "No questions found that meet the selection criteria.");
      } else {
        console.error('Error: Missing data from server response.');
        alert('An error occurred while processing your request. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while processing your request. Please check your network connection and try again.');
    });
  }

  function handleAddButtonClick() {
    const selectedCheckboxes = document.querySelectorAll('.results-table tbody input[type="checkbox"]:checked');
    let totalPoints = 0;
  
    if (selectedCheckboxes.length > 0) {
      selectedCheckboxes.forEach(checkbox => {
        addQuestionToSelected(checkbox);
        totalPoints += parseInt(checkbox.closest('tr').cells[0].textContent) || 0;
        checkbox.checked = false;
      });
  
      adjustAnimatedBorderPosition();
      animatedBorder.classList.add('animate');
  
      const submitTablePointValueTd = document.querySelector('.submit-table tr td:first-child');
      if (submitTablePointValueTd) {
        submitTablePointValueTd.textContent = totalPoints;
      }
    }
  }
  
  function addQuestionToSelected(checkbox) {
    const row = checkbox.closest('tr');
    const newRow = selectedTableBody.insertRow();
    const newCell1 = newRow.insertCell(0);
    const newCell2 = newRow.insertCell(1);
    const newCell3 = newRow.insertCell(2);

    newCell1.textContent = row.cells[0].textContent;
    newCell2.textContent = row.cells[1].textContent;
    newCell3.appendChild(createRemoveButton(newRow));
  }

  function createRemoveButton(row) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-button';
    removeButton.onclick = function() {
      row.remove();
    };
    return removeButton;
  }

  function adjustAnimatedBorderPosition() {
    const toggleRect = sidePanelToggle.getBoundingClientRect();
    const containerRect = mainContainer.getBoundingClientRect();
  
    const topPosition = toggleRect.top - containerRect.top + mainContainer.scrollTop;
    const rightPosition = containerRect.right - toggleRect.right;
  
    animatedBorder.style.top = `${topPosition - 5}px`;
    animatedBorder.style.right = `${rightPosition - 17}px`;
    animatedBorder.style.width = `8.5%`;
    animatedBorder.style.height = `6.5%`;
  }
});

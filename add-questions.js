let questions = [];

// Load saved state
const saved = sessionStorage.getItem("quizQuestions");
if (saved) questions = JSON.parse(saved);

// Add new question
function addQuestion() {
  const q = document.getElementById("question").value.trim();
  const opt1 = document.getElementById("opt1").value.trim();
  const opt2 = document.getElementById("opt2").value.trim();
  const opt3 = document.getElementById("opt3").value.trim();
  const opt4 = document.getElementById("opt4").value.trim();
  const correct = document.getElementById("correct").value.trim();
  const error = document.getElementById("error-msg");

  if (!q || !opt1 || !opt2 || !opt3 || !opt4 || !correct) {
    error.textContent = "Fill all fields!";
    return;
  }

  const options = [opt1, opt2, opt3, opt4];
  if (!options.includes(correct)) {
    error.textContent = "Correct answer must match one of the options.";
    return;
  }

  questions.push({ question: q, options, answer: correct });
  sessionStorage.setItem("quizQuestions", JSON.stringify(questions)); // Save progress
  renderQuestions();
  clearInputs();
}

function clearInputs() {
  document.querySelectorAll("input:not([type='button'])").forEach(i => i.value = "");
  document.getElementById("error-msg").textContent = "";
}

function renderQuestions() {
  const list = document.getElementById("question-list");
  list.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question-item";
    div.innerHTML = `
      <strong>Q${index + 1}: ${q.question}</strong><br>
      ${q.options.map(opt => `- ${opt}`).join("<br>")}<br>
      <em>Answer: ${q.answer}</em><br>
      <button onclick="deleteQuestion(${index})">Delete</button>
    `;
    list.appendChild(div);
  });
}

function deleteQuestion(index) {
  if (!confirm("Are you sure you want to delete this question?")) return;
  questions.splice(index, 1);
  sessionStorage.setItem("quizQuestions", JSON.stringify(questions)); // Update state
  renderQuestions();
}

function finalizeQuiz() {
  const quizId = sessionStorage.getItem('quizId');
  const quizDuration = sessionStorage.getItem('quizDuration');
  const error = document.getElementById("error-msg");

  if (!quizId || isNaN(parseInt(quizDuration))) {
    error.textContent = "Quiz session data is missing. Please go back and set quiz ID.";
    return;
  }

  if (questions.length === 0) {
    error.textContent = "Add at least one question!";
    return;
  }

  const quizData = {
    quizId,
    duration: parseInt(quizDuration),
    createdAt: new Date().toISOString(),
    questions
  };

  fetch("http://localhost:3000/api/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quizData)
  })
    .then(res => res.json())
    .then(data => {
      alert("Quiz saved successfully with ID: " + quizId);
      sessionStorage.removeItem("quizQuestions");
      window.location.href = "index.html";
    })
    .catch(err => {
      error.textContent = "Failed to save quiz.";
      console.error(err);
    });
}

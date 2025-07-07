let questions = [];

// Step 1: Store quiz ID and duration
function goToQuestionPage() {
  const quizId = document.getElementById('quiz-id').value.trim();
  const duration = document.getElementById('duration').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (!quizId || !duration || parseInt(duration) <= 0) {
    errorMsg.textContent = "Please enter a valid Quiz ID and duration.";
    return;
  }

  sessionStorage.setItem('quizId', quizId);
  sessionStorage.setItem('quizDuration', duration);
  window.location.href = "set-questions.html";
}

// Step 2: Add a question
function addQuestion() {
  const q = document.getElementById('question').value.trim();
  const o1 = document.getElementById('opt1').value.trim();
  const o2 = document.getElementById('opt2').value.trim();
  const o3 = document.getElementById('opt3').value.trim();
  const o4 = document.getElementById('opt4').value.trim();
  const correct = document.getElementById('correct').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (!q || !o1 || !o2 || !o3 || !o4 || !correct || ![o1, o2, o3, o4].includes(correct)) {
    errorMsg.innerText = 'Fill all fields correctly. Correct answer must match one of the options.';
    return;
  }

  const newQuestion = { q, options: [o1, o2, o3, o4], correct };
  questions.push(newQuestion);

  const list = document.getElementById('question-list');
  const div = document.createElement('div');
  div.innerText = `${q} → [${[o1, o2, o3, o4].join(', ')}] | Correct: ${correct}`;
  list.appendChild(div);

  // Optional: Save progress
  sessionStorage.setItem('questions', JSON.stringify(questions));

  // Reset fields
  document.getElementById('question').value = '';
  document.getElementById('opt1').value = '';
  document.getElementById('opt2').value = '';
  document.getElementById('opt3').value = '';
  document.getElementById('opt4').value = '';
  document.getElementById('correct').value = '';
  errorMsg.innerText = '';
}

// Step 3: Submit to backend
function finalizeQuiz() {
  const quizId = sessionStorage.getItem('quizId');
  const duration = parseInt(sessionStorage.getItem('quizDuration'));
  if (!quizId || !duration || questions.length === 0) {
    alert("Missing quiz data.");
    return;
  }

  fetch('http://localhost:3000/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId, duration, questions })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Quiz saved successfully.");
      sessionStorage.clear(); // optional reset
      window.location.href = 'index.html';
    })
    .catch(err => {
      console.error(err);
      alert('Failed to save quiz.');
    });
}


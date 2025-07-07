let quizData = {};
let current = 0;
let userId = '';
let quizId = '';
let isAnswerPhase = false;
let answerTimer = null;
let timeLeft = 10;

function startQuiz() {
  quizId = document.getElementById('quiz-id').value.trim();
  userId = document.getElementById('user-id').value.trim();

  if (!quizId || !userId) {
    document.getElementById('start-error').innerText = 'Enter valid quiz ID and user ID.';
    return;
  }

  fetch(`http://localhost:3000/api/quizzes/${quizId}`)
    .then(res => res.json())
    .then(data => {
      quizData = data;
      if (!quizData.questions || quizData.questions.length === 0) {
        document.getElementById('start-error').innerText = 'Quiz has no questions.';
        return;
      }

      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('quiz-screen').classList.remove('hidden');
      loadQuestion();
    })
    .catch(() => {
      document.getElementById('start-error').innerText = 'Quiz not found.';
    });
}

function loadQuestion() {
  isAnswerPhase = false;
  const q = quizData.questions[current];
  if (!q) return;

  document.getElementById('question-text').innerText = q.q || q.question;
  const ul = document.getElementById('options');
  ul.innerHTML = '';

  q.options.forEach(opt => {
    const li = document.createElement('li');
    li.innerText = opt;
    li.onclick = () => {
      if (isAnswerPhase) {
        submitAnswer(opt);
        disableOptions();
      }
    };
    ul.appendChild(li);
  });

  let readingTime = 30;
  const timerBox = document.getElementById('timer-box');
  timerBox.innerText = `Reading Time: ${readingTime}`;
  const readInterval = setInterval(() => {
    readingTime--;
    timerBox.innerText = `Reading Time: ${readingTime}`;
    if (readingTime <= 0) {
      clearInterval(readInterval);
      startAnswerTimer();
    }
  }, 1000);
}

function startAnswerTimer() {
  isAnswerPhase = true;
  timeLeft = 10;
  const timerBox = document.getElementById('timer-box');
  timerBox.innerText = `Answer Time: ${timeLeft}`;

  answerTimer = setInterval(() => {
    timeLeft--;
    timerBox.innerText = `Answer Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(answerTimer);
      submitAnswer(null);
      disableOptions();
    }
  }, 1000);
}

function submitAnswer(answer) {
  clearInterval(answerTimer);
  isAnswerPhase = false;

  const correct = quizData.questions[current].correct;
  const score = (answer === correct) ? timeLeft * 100 : 0;

  // Highlight selected
  document.querySelectorAll('#options li').forEach(li => {
    if (li.innerText === answer) {
      li.classList.add("selected");
    }
  });

  fetch(`http://localhost:3000/api/leaderboard/${quizId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, question: current, score })
  })
    .then(() => {
      current++;
      if (current < quizData.questions.length) {
        showLeaderboard(false, () => loadQuestion());
      } else {
        showLeaderboard(true);
      }
    });
}

function showLeaderboard(final = false, callback = null) {
  fetch(`http://localhost:3000/api/leaderboard/${quizId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('leaderboard-box').classList.remove('hidden');
      const list = document.getElementById('leaderboard-list');
      list.innerHTML = '';

      const userScores = {};
      data.forEach(entry => {
        if (!userScores[entry.userId]) userScores[entry.userId] = 0;
        userScores[entry.userId] += entry.score;
      });

      const sorted = Object.entries(userScores).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([user, total]) => {
        const li = document.createElement('li');
        li.innerText = `${user}: ${total} pts`;
        list.appendChild(li);
      });

      if (final) {
        alert('🎉 Quiz completed!');
        document.getElementById('question-text').innerText = "Quiz Completed!";
        document.getElementById('options').innerHTML = "";
        document.getElementById('timer-box').innerText = "";
      } else if (callback) {
        setTimeout(() => {
          document.getElementById('leaderboard-box').classList.add('hidden');
          callback();
        }, 3000);
      }
    });
}

function disableOptions() {
  document.querySelectorAll('#options li').forEach(li => {
    li.style.pointerEvents = 'none';
    li.style.opacity = '0.6';
  });
}


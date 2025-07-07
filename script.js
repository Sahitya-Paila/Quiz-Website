let quizData = {};
let currentQuestionIndex = 0;
let userId = '';
let quizId = '';
let timeLeft = 10;
let answerTimer = null;
let readingTimer = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function startQuizDynamic(inputQuizId, inputUserId) {
  quizId = inputQuizId;
  userId = inputUserId;

  fetch(`http://localhost:3000/api/quizzes/${quizId}`)
    .then(res => {
      if (!res.ok) throw new Error("Quiz not found");
      return res.json();
    })
    .then(data => {
      quizData = data;
      currentQuestionIndex = 0;
      showQuestion();
    })
    .catch(() => {
      alert('Quiz not found!');
    });
}

function showQuestion() {
  const q = quizData.questions[currentQuestionIndex];
  document.getElementById('question-text').innerText = q.question;
  const optionsList = document.getElementById('options');
  optionsList.innerHTML = '';

  q.options.forEach(opt => {
    const li = document.createElement('li');
    li.textContent = opt;
    li.onclick = () => {
      handleAnswer(opt);
      disableOptions();
      li.classList.add("selected");
    };
    optionsList.appendChild(li);
  });

  startReadingTimer();
}

function startReadingTimer() {
  clearInterval(readingTimer);
  let readingTime = 30;
  const timerBox = document.getElementById('timer-box');
  timerBox.innerText = `Reading Time: ${readingTime}`;
  readingTimer = setInterval(() => {
    readingTime--;
    timerBox.innerText = `Reading Time: ${readingTime}`;
    if (readingTime <= 0) {
      clearInterval(readingTimer);
      startAnswerTimer();
    }
  }, 1000);
}

function startAnswerTimer() {
  clearInterval(answerTimer);
  timeLeft = 10;
  const timerBox = document.getElementById('timer-box');
  timerBox.innerText = `Answer Time: ${timeLeft}`;
  answerTimer = setInterval(() => {
    timeLeft--;
    timerBox.innerText = `Answer Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(answerTimer);
      handleAnswer(null);
      disableOptions();
    }
  }, 1000);
}

function handleAnswer(selectedAnswer) {
  clearInterval(answerTimer);
  clearInterval(readingTimer);

  const currentQ = quizData.questions[currentQuestionIndex];
  const correct = currentQ.answer; // or currentQ.correct
  const score = selectedAnswer === correct ? timeLeft * 100 : 0;

  fetch(`http://localhost:3000/api/leaderboard/${quizId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, question: currentQuestionIndex, score })
  }).then(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.questions.length) {
      loadLeaderboard(false, () => showQuestion());
    } else {
      loadLeaderboard(true);
    }
  });
}

function loadLeaderboard(final = false, callback = null) {
  fetch(`http://localhost:3000/api/leaderboard/${quizId}`)
    .then(res => res.json())
    .then(data => {
      const leaderboardBox = document.getElementById('leaderboard-box');
      leaderboardBox.classList.remove('hidden');
      const list = document.getElementById('leaderboard-list');
      list.innerHTML = '';

      const scores = {};
      data.forEach(entry => {
        scores[entry.userId] = (scores[entry.userId] || 0) + entry.score;
      });

      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

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
          leaderboardBox.classList.add('hidden');
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

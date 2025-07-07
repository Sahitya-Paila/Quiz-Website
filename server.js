const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

/* -----------------------------
   API to create a new quiz
----------------------------- */
app.post('/api/quizzes', async (req, res) => {
  const { quizId, duration, questions } = req.body;

  try {
    await pool.query(`INSERT INTO quizzes (id, duration) VALUES (?, ?)`, [quizId, duration]);

    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (quiz_id, question, opt1, opt2, opt3, opt4, correct_answer)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [quizId, q.q, q.options[0], q.options[1], q.options[2], q.options[3], q.correct]
      );
    }

    res.status(201).json({ message: 'Quiz saved to DB' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB Error' });
  }
});

/* -----------------------------
   API to get quiz by ID
----------------------------- */
app.get('/api/quizzes/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    const [quizRows] = await pool.query(`SELECT * FROM quizzes WHERE id = ?`, [quizId]);
    if (quizRows.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const [questions] = await pool.query(
      `SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC`, [quizId]);

    const formattedQuestions = questions.map(q => ({
      q: q.question,
      options: [q.opt1, q.opt2, q.opt3, q.opt4],
      correct: q.correct_answer
    }));

    res.json({
      quizId,
      duration: quizRows[0].duration,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load quiz' });
  }
});

/* -----------------------------
   API to submit score
----------------------------- */
app.post('/api/leaderboard/:id', async (req, res) => {
  const quizId = req.params.id;
  const { userId, question, score } = req.body;

  try {
    await pool.query(
      `INSERT INTO users (id) VALUES (?) ON DUPLICATE KEY UPDATE id=id`,
      [userId]
    );

    const [questions] = await pool.query(
      `SELECT id FROM questions WHERE quiz_id = ? ORDER BY id LIMIT 1 OFFSET ?`,
      [quizId, question]
    );
    if (questions.length === 0)
      return res.status(400).json({ message: 'Invalid question index' });

    const questionId = questions[0].id;

    // ✅ Insert or update score (only keep highest score per question per user)
    await pool.query(
      `INSERT INTO answers (user_id, quiz_id, question_id, score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))`,
      [userId, quizId, questionId, score]
    );

    res.status(200).json({ message: 'Score submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Score submit failed' });
  }
});

/* -----------------------------
   API to get leaderboard
----------------------------- */
app.get('/api/leaderboard/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    const [rows] = await pool.query(`
      SELECT user_id, SUM(score) AS total_score
      FROM answers
      WHERE quiz_id = ?
      GROUP BY user_id
      ORDER BY total_score DESC
    `, [quizId]);

    res.json(rows.map(r => ({
      userId: r.user_id,
      score: r.total_score
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Leaderboard error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

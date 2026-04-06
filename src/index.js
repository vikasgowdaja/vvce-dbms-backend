const express = require("express");
const cors = require("cors");
const questions = require("./data/questions");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// GET /api/questions — all questions (with optional filters)
app.get("/api/questions", (req, res) => {
  let result = [...questions];

  const { section, db, search, tag } = req.query;

  if (section) result = result.filter((q) => q.section === section);
  if (db) result = result.filter((q) => q.db === db);
  if (tag) result = result.filter((q) => q.tags.includes(tag));
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (q) =>
        q.question.toLowerCase().includes(s) ||
        q.topic.toLowerCase().includes(s) ||
        q.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  res.json({
    total: result.length,
    questions: result.map(({ answer, hint, ...rest }) => rest), // omit answer/hint in list
  });
});

// GET /api/questions/:id — single question (includes answer + hint)
app.get("/api/questions/:id", (req, res) => {
  const q = questions.find((q) => q.id === parseInt(req.params.id));
  if (!q) return res.status(404).json({ error: "Question not found" });
  res.json(q);
});

// GET /api/sections — distinct sections
app.get("/api/sections", (req, res) => {
  const seen = new Set();
  const sections = [];
  questions.forEach((q) => {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push({ id: q.section, title: q.sectionTitle });
    }
  });
  res.json(sections);
});

// GET /api/stats — summary statistics
app.get("/api/stats", (req, res) => {
  const bySection = {};
  const byDb = {};
  questions.forEach((q) => {
    bySection[q.section] = (bySection[q.section] || 0) + 1;
    byDb[q.db] = (byDb[q.db] || 0) + 1;
  });
  res.json({
    total: questions.length,
    bySection,
    byDb,
  });
});

// POST /api/check — check a user's answer (simple fuzzy compare)
app.post("/api/check", (req, res) => {
  const { id, userAnswer } = req.body;
  const q = questions.find((q) => q.id === parseInt(id));
  if (!q) return res.status(404).json({ error: "Question not found" });

  const normalize = (s) =>
    s.replace(/\s+/g, " ").replace(/;$/, "").trim().toLowerCase();

  const correct = normalize(q.answer);
  const user = normalize(userAnswer || "");

  // exact match after normalisation
  const isExact = correct === user;

  // keyword match — check key SQL keywords present
  const keywords = ["select", "from", "where", "join", "group", "having", "order"];
  const keywordsPresent = keywords.filter((kw) => correct.includes(kw));
  const userHas = keywordsPresent.filter((kw) => user.includes(kw));
  const score = keywordsPresent.length
    ? Math.round((userHas.length / keywordsPresent.length) * 100)
    : 100;

  res.json({
    isExact,
    score,
    correctAnswer: q.answer,
    hint: q.hint,
  });
});

app.listen(PORT, () =>
  console.log(`SQL Masterclass API running on http://localhost:${PORT}`)
);

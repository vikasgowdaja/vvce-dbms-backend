const express = require("express");
const cors = require("cors");
const questions = require("./data/questions");
const { amazonPool, netflixPool, spotifyPool } = require("./db");
const logger = require("./logger");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});

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

// ─────────────────────────────────────────────
//  AMAZON ROUTES  (/api/amazon/*)
// ─────────────────────────────────────────────

app.get("/api/amazon/categories", async (_req, res) => {
  try {
    const [rows] = await amazonPool.query(`
      SELECT c.category_id  AS id,
             c.category_name AS name,
             p.category_name AS parent
      FROM   categories c
      LEFT JOIN categories p ON c.parent_id = p.category_id
      ORDER BY c.category_id
    `);
    res.json(rows);
  } catch (e) {
    logger.error({ route: '/api/amazon/categories', error: e.message, stack: e.stack });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/amazon/products", async (req, res) => {
  const { category, search, sort } = req.query;

  // Whitelist sort values → SQL ORDER BY clause
  const sortMap = {
    price_asc:  "p.price ASC",
    price_desc: "p.price DESC",
    rating:     "avgRating DESC",
  };
  const orderBy = sortMap[sort] || "p.product_id ASC";

  const conditions = [];
  const params = [];

  if (category && category !== "all") {
    const catNum = parseInt(category, 10);
    if (!isNaN(catNum)) {
      conditions.push("p.category_id = ?");
      params.push(catNum);
    } else {
      conditions.push("LOWER(c.category_name) = LOWER(?)");
      params.push(category);
    }
  }
  if (search) {
    conditions.push(
      "(LOWER(p.product_name) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(c.category_name) LIKE ?)"
    );
    const like = `%${search.toLowerCase()}%`;
    params.push(like, like, like);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [[{ total }]] = await amazonPool.query(
      `SELECT COUNT(DISTINCT p.product_id) AS total
       FROM products p
       INNER JOIN categories c ON p.category_id = c.category_id
       INNER JOIN sellers    s ON p.seller_id   = s.seller_id
       LEFT  JOIN reviews    r ON p.product_id  = r.product_id
       ${where}`,
      params
    );

    const [products] = await amazonPool.query(
      `SELECT p.product_id             AS id,
              p.product_name           AS name,
              p.category_id            AS categoryId,
              c.category_name          AS category,
              s.seller_name            AS seller,
              p.price,
              p.stock_qty              AS stock,
              p.brand,
              ROUND(AVG(r.rating), 1)  AS avgRating,
              COUNT(r.review_id)       AS reviewCount
       FROM   products p
       INNER JOIN categories c ON p.category_id = c.category_id
       INNER JOIN sellers    s ON p.seller_id   = s.seller_id
       LEFT  JOIN reviews    r ON p.product_id  = r.product_id
       ${where}
       GROUP BY p.product_id
       ORDER BY ${orderBy}`,
      params
    );

    res.json({ total, products });
  } catch (e) {
    logger.error({ route: '/api/amazon/products', error: e.message, query: req.query });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/amazon/reviews", async (req, res) => {
  const { productId } = req.query;
  const conditions = [];
  const params = [];

  if (productId) {
    const pid = parseInt(productId, 10);
    if (!isNaN(pid)) {
      conditions.push("r.product_id = ?");
      params.push(pid);
    }
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [rows] = await amazonPool.query(
      `SELECT r.review_id       AS id,
              r.product_id      AS productId,
              p.product_name    AS product,
              c.full_name       AS customer,
              r.rating,
              r.review_text     AS text,
              r.review_date     AS date
       FROM   reviews r
       INNER JOIN products  p ON r.product_id  = p.product_id
       INNER JOIN customers c ON r.customer_id = c.customer_id
       ${where}
       ORDER BY r.review_date DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/amazon/orders", async (_req, res) => {
  try {
    const [rows] = await amazonPool.query(`
      SELECT o.order_id    AS id,
             c.full_name   AS customer,
             o.order_date  AS date,
             o.status,
             o.total_amount AS total,
             GROUP_CONCAT(p.product_name ORDER BY oi.order_item_id SEPARATOR '||') AS items
      FROM   orders o
      INNER JOIN customers   c  ON o.customer_id = c.customer_id
      INNER JOIN order_items oi ON o.order_id   = oi.order_id
      INNER JOIN products    p  ON oi.product_id = p.product_id
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
    `);
    const orders = rows.map((row) => ({
      ...row,
      items: row.items ? row.items.split("||") : [],
    }));
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
//  NETFLIX ROUTES  (/api/netflix/*)
// ─────────────────────────────────────────────

app.get("/api/netflix/genres", async (_req, res) => {
  try {
    const [rows] = await netflixPool.query(
      "SELECT genre_id AS id, genre_name AS name FROM genres ORDER BY genre_id"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/netflix/content", async (req, res) => {
  const { genre, type, search, sort } = req.query;

  const sortMap = {
    imdb:    "c.imdb_score DESC",
    year:    "c.release_year DESC",
    popular: "watchCount DESC",
  };
  const orderBy = sortMap[sort] || "c.content_id ASC";

  const conditions = [];
  const params = [];

  if (genre && genre !== "all") {
    const gNum = parseInt(genre, 10);
    if (!isNaN(gNum)) {
      conditions.push("c.genre_id = ?");
      params.push(gNum);
    } else {
      conditions.push("LOWER(g.genre_name) = LOWER(?)");
      params.push(genre);
    }
  }
  if (type && type !== "all") {
    conditions.push("LOWER(c.content_type) = LOWER(?)");
    params.push(type);
  }
  if (search) {
    conditions.push(
      "(LOWER(c.title) LIKE ? OR LOWER(g.genre_name) LIKE ? OR LOWER(d.director_name) LIKE ?)"
    );
    const like = `%${search.toLowerCase()}%`;
    params.push(like, like, like);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [[{ total }]] = await netflixPool.query(
      `SELECT COUNT(DISTINCT c.content_id) AS total
       FROM   content c
       INNER JOIN genres g              ON c.genre_id    = g.genre_id
       LEFT  JOIN content_directors cd  ON c.content_id  = cd.content_id
       LEFT  JOIN directors d           ON cd.director_id = d.director_id
       LEFT  JOIN watch_history wh      ON c.content_id  = wh.content_id
       ${where}`,
      params
    );

    const [content] = await netflixPool.query(
      `SELECT c.content_id                                 AS id,
              c.title,
              c.content_type                               AS type,
              g.genre_name                                 AS genre,
              c.genre_id                                   AS genreId,
              c.release_year                               AS year,
              c.duration_min                               AS duration,
              c.seasons,
              c.language,
              c.country,
              c.age_rating                                 AS ageRating,
              c.imdb_score                                 AS imdb,
              SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT d.director_name ORDER BY d.director_name SEPARATOR ', '), ', ', 1) AS director,
              COUNT(DISTINCT wh.watch_id)                  AS watchCount
       FROM   content c
       INNER JOIN genres g              ON c.genre_id     = g.genre_id
       LEFT  JOIN content_directors cd  ON c.content_id   = cd.content_id
       LEFT  JOIN directors d           ON cd.director_id = d.director_id
       LEFT  JOIN watch_history wh      ON c.content_id   = wh.content_id
       ${where}
       GROUP BY c.content_id,
                c.title,
                c.content_type,
                g.genre_name,
                c.genre_id,
                c.release_year,
                c.duration_min,
                c.seasons,
                c.language,
                c.country,
                c.age_rating,
                c.imdb_score
       ORDER BY ${orderBy}`,
      params
    );

    res.json({ content, total });
  } catch (e) {
    logger.error({ route: '/api/netflix/content', error: e.message, query: req.query });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/netflix/trending", async (_req, res) => {
  try {
    const [rows] = await netflixPool.query(`
      SELECT c.content_id            AS id,
             c.title,
             c.content_type          AS type,
             g.genre_name            AS genre,
             c.genre_id              AS genreId,
             c.release_year          AS year,
             c.imdb_score            AS imdb,
             c.age_rating            AS ageRating,
             c.duration_min          AS duration,
             c.seasons,
             c.language,
             COUNT(DISTINCT wh.watch_id) AS watchCount
      FROM   content c
      INNER JOIN genres        g  ON c.genre_id   = g.genre_id
      INNER JOIN watch_history wh ON c.content_id = wh.content_id
      GROUP BY c.content_id,
               c.title,
               c.content_type,
               g.genre_name,
               c.genre_id,
               c.release_year,
               c.imdb_score,
               c.age_rating,
               c.duration_min,
               c.seasons,
               c.language
      ORDER BY watchCount DESC
      LIMIT 6
    `);
    res.json(rows);
  } catch (e) {
    logger.error({ route: '/api/netflix/trending', error: e.message });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/netflix/subscribers", async (_req, res) => {
  try {
    const [rows] = await netflixPool.query(`
      SELECT subscriber_id AS id,
             full_name     AS name,
             country,
             plan,
             is_active     AS isActive,
             joined_year   AS joinedYear
      FROM   subscribers
      ORDER BY subscriber_id
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
//  SPOTIFY ROUTES  (/api/spotify/*)
// ─────────────────────────────────────────────

app.get("/api/spotify/artists", async (_req, res) => {
  try {
    const [rows] = await spotifyPool.query(`
      SELECT artist_id          AS id,
             artist_name        AS name,
             genre,
             country,
             monthly_listeners  AS monthlyListeners,
             verified
      FROM   artists
      ORDER BY monthly_listeners DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/spotify/songs", async (req, res) => {
  const { artist, search, sort, language } = req.query;

  const sortMap = {
    streams: "s.streams_count DESC",
    recent:  "s.release_date DESC",
  };
  const orderBy = sortMap[sort] || "s.song_name ASC";

  const conditions = [];
  const params = [];

  if (artist) {
    const artNum = parseInt(artist, 10);
    if (!isNaN(artNum)) {
      conditions.push("s.artist_id = ?");
      params.push(artNum);
    }
  }
  if (language && language !== "all") {
    conditions.push("LOWER(s.language) = LOWER(?)");
    params.push(language);
  }
  if (search) {
    conditions.push(
      "(LOWER(s.song_name) LIKE ? OR LOWER(a.artist_name) LIKE ?)"
    );
    const like = `%${search.toLowerCase()}%`;
    params.push(like, like);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [[{ total }]] = await spotifyPool.query(
      `SELECT COUNT(*) AS total
       FROM   songs s
       INNER JOIN artists a ON s.artist_id = a.artist_id
       INNER JOIN albums  al ON s.album_id  = al.album_id
       ${where}`,
      params
    );

    const [songs] = await spotifyPool.query(
      `SELECT s.song_id            AS id,
              s.song_name          AS name,
              s.artist_id          AS artistId,
              a.artist_name        AS artist,
              al.album_name        AS album,
              s.duration_sec       AS durationSec,
              s.language,
              s.streams_count      AS streams,
              s.explicit,
              s.release_date       AS releaseDate
       FROM   songs s
       INNER JOIN artists a  ON s.artist_id = a.artist_id
       INNER JOIN albums  al ON s.album_id  = al.album_id
       ${where}
       ORDER BY ${orderBy}`,
      params
    );

    res.json({ songs, total });
  } catch (e) {
    logger.error({ route: '/api/spotify/songs', error: e.message, query: req.query });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/spotify/playlists", async (_req, res) => {
  try {
    const [playlists] = await spotifyPool.query(`
      SELECT pl.playlist_id   AS id,
             pl.playlist_name AS name,
             u.username       AS owner,
             pl.is_public     AS isPublic
      FROM   playlists pl
      LEFT JOIN users u ON pl.user_id = u.user_id
      ORDER BY pl.playlist_id
    `);

    const enriched = await Promise.all(
      playlists.map(async (pl) => {
        const [songs] = await spotifyPool.query(
          `SELECT s.song_id        AS id,
                  s.song_name      AS name,
                  a.artist_name    AS artist,
                  al.album_name    AS album,
                  s.duration_sec   AS durationSec,
                  s.streams_count  AS streams,
                  s.language,
                  s.explicit
           FROM   playlist_songs ps
           INNER JOIN songs   s  ON ps.song_id   = s.song_id
           INNER JOIN artists a  ON s.artist_id  = a.artist_id
           INNER JOIN albums  al ON s.album_id   = al.album_id
           WHERE  ps.playlist_id = ?
           ORDER BY ps.position`,
          [pl.id]
        );
        return { ...pl, songs };
      })
    );

    res.json(enriched);
  } catch (e) {
    logger.error({ route: '/api/spotify/playlists', error: e.message });
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/spotify/top-charts", async (_req, res) => {
  try {
    const [rows] = await spotifyPool.query(`
      SELECT s.song_id        AS id,
             s.song_name      AS name,
             a.artist_name    AS artist,
             al.album_name    AS album,
             s.streams_count  AS streams,
             s.duration_sec   AS durationSec,
             s.language,
             s.explicit
      FROM   songs s
      INNER JOIN artists a  ON s.artist_id = a.artist_id
      INNER JOIN albums  al ON s.album_id  = al.album_id
      ORDER BY s.streams_count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -────────────────────────────────────────────
//  HEALTH & LOGGING ROUTES
// -────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  try {
    // Test each database connection
    await amazonPool.query("SELECT 1");
    await netflixPool.query("SELECT 1");
    await spotifyPool.query("SELECT 1");
    logger.info({ event: 'health_check', status: 'healthy' });
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (e) {
    logger.error({ event: 'health_check', status: 'unhealthy', error: e.message });
    res.status(503).json({ status: 'unhealthy', error: e.message });
  }
});

app.get("/api/logs", (_req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, '../logs');
  try {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log')).sort().reverse();
    res.json({
      timestamp: new Date().toISOString(),
      logsDirectory: logsDir,
      files: files.map(f => ({
        name: f,
        path: logsDir + '/' + f,
        createdAt: fs.statSync(path.join(logsDir, f)).mtime,
      })),
      note: 'Use GET /api/logs/combined or /api/logs/error to view log contents',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/logs/:logfile", (_req, res) => {
  const fs = require('fs');
  const path = require('path');
  const { logfile } = _req.params;
  const filePath = path.join(__dirname, '../logs', `${logfile}.log`);
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Log file not found: ${logfile}` });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim()).map(l => {
      try {
        return JSON.parse(l);
      } catch {
        return { raw: l };
      }
    });
    res.json({
      logfile: `${logfile}.log`,
      entries: lines.length,
      lines: lines.slice(-100), // Last 100 entries
    });
  } catch (e) {
    logger.error({ route: `/api/logs/${logfile}`, error: e.message });
    res.status(500).json({ error: e.message });
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  logger.error({ error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`SQL Masterclass API running on http://localhost:${PORT}`);
});

const Article = require('../models/Article');

// USER - Get all articles (can filter by category)
const getAllArticles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json({ count: articles.length, articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER - Get a single article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - Create a new article
const createArticle = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const article = await Article.create({
      title,
      content,
      category,
      createdBy: req.user.userId
    });

    res.status(201).json({ message: 'Article created', article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - Update an article
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) return res.status(404).json({ error: 'Article not found' });

    res.json({ message: 'Article updated', article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - Delete an article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle };
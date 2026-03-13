const express = require('express');
const router = express.Router();
const { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');
const { authenticate, adminOnly } = require('../middleware/auth');

// USER - read articles (no login needed)
router.get('/', getAllArticles);             // get all articles
router.get('/:id', getArticleById);         // get one article

// ADMIN - manage articles
router.post('/', authenticate, adminOnly, createArticle);          // create
router.put('/:id', authenticate, adminOnly, updateArticle);        // update
router.delete('/:id', authenticate, adminOnly, deleteArticle);     // delete

module.exports = router;
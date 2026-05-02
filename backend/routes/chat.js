const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getChats, saveChats } = require('../utils/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'lingua-bridge-super-secret-key';

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const chatSchema = Joi.object({
  sourceText: Joi.string().required(),
  targetText: Joi.string().required(),
  sourceLang: Joi.string().required(),
  targetLang: Joi.string().required(),
  audioUrl: Joi.string().uri().allow(null, ''),
  sentiment: Joi.string().allow(null, ''),
  emotion: Joi.string().allow(null, ''),
  summary: Joi.string().allow(null, '')
});

// Get user chats
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const chats = await getChats();
    const userChats = chats.filter(chat => chat.userId === req.user.id);
    res.json(userChats);
  } catch (error) {
    next(error);
  }
});

// Save a chat message
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { error } = chatSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { sourceText, targetText, sourceLang, targetLang, audioUrl, sentiment, emotion, summary } = req.body;
    
    const chats = await getChats();
    
    const newChat = {
      id: Date.now().toString(),
      userId: req.user.id,
      sourceText,
      targetText,
      sourceLang,
      targetLang,
      audioUrl: audioUrl || null,
      sentiment: sentiment || null,
      emotion: emotion || null,
      summary: summary || null,
      timestamp: new Date().toISOString()
    };

    chats.push(newChat);
    await saveChats(chats);

    res.status(201).json(newChat);
  } catch (error) {
    next(error);
  }
});

// Get analytics
router.get('/analytics', authMiddleware, async (req, res, next) => {
    try {
        const chats = await getChats();
        const userChats = chats.filter(chat => chat.userId === req.user.id);

        const totalTranslations = userChats.length;
        
        const languagesUsed = new Set();
        userChats.forEach(c => {
            languagesUsed.add(c.sourceLang);
            languagesUsed.add(c.targetLang);
        });

        // Basic mock data since real logic would be complex aggregation
        res.json({
            totalTranslations,
            languagesCount: languagesUsed.size,
            accuracy: 94.5, // Mock value
            recentConversations: userChats.slice(-5).reverse(),
        });
    } catch(error) {
        next(error);
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();

const prisma = new PrismaClient();

// POST /api/register
router.post('/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password, dateOfBirth } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const registrationNumber = `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          registrationNumber,
          dateOfBirth: new Date(dateOfBirth),
        },
      });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
      res.json({ token, role: user.role });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/profile
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;

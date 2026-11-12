import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as auth from '../services/authService';
import { parse, wrap } from '../utils/http';

const r = Router();
r.post('/register', wrap(async (req, res) => res.status(201).json(await auth.register(parse(auth.registerSchema, req.body)))));
r.post('/login', wrap(async (req, res) => res.json(await auth.login(parse(auth.loginSchema, req.body)))));
r.get('/me', requireAuth, wrap(async (req, res) => res.json(await auth.me(req.user.id))));
r.put('/me', requireAuth, wrap(async (req, res) => res.json(await auth.updateProfile(req.user.id, parse(auth.profileSchema, req.body)))));
r.put('/password', requireAuth, wrap(async (req, res) => { await auth.changePassword(req.user.id, parse(auth.passwordSchema, req.body)); res.status(204).end(); }));
export default r;

import { Router } from 'express';
import {
  exchangeGoogleCode,
  googleCallback,
  login,
  signup,
  startGoogleAuth,
  refresh
} from './auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/exchange', exchangeGoogleCode);

router.post('/refresh', refresh);

export default router;

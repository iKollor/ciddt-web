import { Router } from 'express';
import { verifyUser, registerUser } from './controllers.js';

const router = Router();

router.post('/verify-user', verifyUser);
router.post('/registro', registerUser);

export default router;

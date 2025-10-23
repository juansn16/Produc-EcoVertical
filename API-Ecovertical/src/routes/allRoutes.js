import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import gardenRoutes from './gardenRoutes.js';
import locationRoutes from './locationRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import commentRoutes from './commentRoutes.js';
import statisticsRoutes from './statisticsRoutes.js';
import alertRoutes from './alertRoutes.js';
import reportRoutes from './reportRoutes.js';
import plantRoutes from './plantRoutes.js';
import providerRoutes from './providerRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import invitationCodeRoutes from './invitationCodeRoutes.js';
import migrationRoutes from './migrationRoutes.js';
import irrigationAlertRoutes from './irrigationAlertRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gardens', gardenRoutes);
router.use('/locations', locationRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/comments', commentRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/alerts', alertRoutes);
router.use('/irrigation-alerts', irrigationAlertRoutes);
router.use('/reports', reportRoutes);
router.use('/plants', plantRoutes);
router.use('/providers', providerRoutes);
router.use('/categories', categoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/invitation-codes', invitationCodeRoutes);
router.use('/migration', migrationRoutes);

export default router;

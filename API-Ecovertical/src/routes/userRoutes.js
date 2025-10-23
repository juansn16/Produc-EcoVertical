import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getCondominiumUsers,
  assignTechnicianRole,
  removeTechnicianRole
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { isAdmin, canManageCondominiumUsers } from "../middleware/roleMiddleware.js";
import {
  validateUpdateProfile,
  validateChangePassword,
  validateAdminUpdateUser,
  validateGetCondominiumUsers,
  validateAssignTechnicianRole,
  validateRemoveTechnicianRole
} from "../validators/userValidators.js";

const router = express.Router();

// Perfil propio
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, validateUpdateProfile, updateMyProfile);
router.put("/change-password", protect, validateChangePassword, changeMyPassword);

// Admin
router.get("/", protect, isAdmin, getUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.put("/:id", protect, isAdmin, validateAdminUpdateUser, updateUserById);
router.delete("/:id", protect, isAdmin, deleteUserById);

// Gestión de roles por condominio (administradores y residentes para gestión de permisos)
router.get("/condominium/users", protect, authorizeRoles(['administrador', 'residente']), validateGetCondominiumUsers, getCondominiumUsers);
router.put("/:id/assign-technician", protect, isAdmin, canManageCondominiumUsers, validateAssignTechnicianRole, assignTechnicianRole);
router.put("/:id/remove-technician", protect, isAdmin, canManageCondominiumUsers, validateRemoveTechnicianRole, removeTechnicianRole);

export default router;
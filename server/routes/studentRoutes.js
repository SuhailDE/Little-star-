import { Router } from 'express';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  listStudents,
  updateStudent,
} from '../controllers/studentController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);
router.get('/', listStudents);
router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;

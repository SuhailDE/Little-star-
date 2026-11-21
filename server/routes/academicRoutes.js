import { Router } from 'express';
import {
  createClass,
  createCourse,
  deleteClass,
  deleteCourse,
  listClasses,
  listCourses,
  updateClass,
  updateCourse,
} from '../controllers/academicController.js';
import { requireAdmin } from '../middleware/auth.js';

export const classRouter = Router();
classRouter.get('/', listClasses);
classRouter.post('/', requireAdmin, createClass);
classRouter.put('/:id', requireAdmin, updateClass);
classRouter.delete('/:id', requireAdmin, deleteClass);

export const courseRouter = Router();
courseRouter.get('/', listCourses);
courseRouter.post('/', requireAdmin, createCourse);
courseRouter.put('/:id', requireAdmin, updateCourse);
courseRouter.delete('/:id', requireAdmin, deleteCourse);


import  express  from "express";
import { createCourse, getAllCourses } from "../controllers/CourseController.js";


const router = express.Router();

// Get all courses without lectures
router.route('/courses').get(getAllCourses);
// create new course
router.route('/createcourses').post(createCourse);

// add lecture , delete course, get Course Details

//delet Lecture

export default router;
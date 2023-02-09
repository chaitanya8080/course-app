
import { CourseModel } from "../models/CourseModel.js";


export const getAllCourses = (async (req, res, next) => {
  
  const courses = await CourseModel.find().select('-lectures');

  res.status(200).json({ success: true, courses });
});




export const createCourse = async (req, res) => {


  const { title, description, category, createdBy } = req.body;

  try {

    if (!title || !description || !category || !createdBy){
      return res.status(400).json({message:"please add all fields"});
    }
  
    // const file = req.file;
  
    // const newCourse = new CourseModel({
    //   title:title,
    //   description:description,
    //   category:category,
    //   createdBy,
    //   poster: {
    //     public_id: "temp",
    //     url: "temp",
    //   },
    // });
  
  const course = await CourseModel.create(req.body);
 res.status(201).json({ success: true, message: "course created" ,course});
    
  } catch (error) {
    return res.status(500).json({error});
  }
    
 
};





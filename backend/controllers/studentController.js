const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getStudentProfile = async (req, res) => {
    const {email}= req.body;
    try{
        const student =await prisma.student.findUnique({
            where:{ email }
        })
        
        if(!student){
            return res.status(404).json({message:'student not found'})
        }
        res.status(200).json(student)
    }
    catch(error)
    {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    
}

const updateStudentProfile = async (req, res) => {
    
    const {
    id,
    name,
    email,
    Institution,
    registerno,
    department,
    AcademicYear,
    Address,
    phone,
    bio,
    skills,
    Achivements
  } = req.body;

  try{
    const updatdeStudent=await prisma.student.update({
        where: { id: Number(id) },
        data: {
            name,
            email,
            Institution,
            registerno,
            department,
            AcademicYear,
            Address,
            phone,
            bio,
            skills,
            Achivements
        }

    })
    res.status(200).json({message:'Profile updated successfully', student: updatdeStudent});    
  }
  catch(error)
  {
    console.error('Error updating student profile:',error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
modeule .export={
    getstudentProfile,
    upadteStudentProfile
}

const { PrismaClient } = require('../generated/prisma');
const { json } = require('express');
const prisma = new PrismaClient();

const add_student = async (req,res) => {
    const { name, email, registerno, department, year } = req.body; 

    if (!name || !email || !registerno || !department || !year){
        return res.status(500).json({ message : "all the fields are required"});
    }

    try {
        const existing = await prisma.student.findFirst({
            where: {
                OR: [
                    { email: email },
                    { registerno: registerno }
                    ]
            }
        });

        if (existing){
            return res.status(500).json({message : "the user with email or regno already exists"});
        }
        
        const add = await prisma.student.create({
            data : {
                name,email,registerno,department,year
            }
        });

        return res.status(200).json({ message : "created successfully"});
    }

    catch (error){
        console.error(error);
        return res.staus(500),json({ message : "internal sever error"});
    }
};


const get_student = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { 
        id: true,
        name: true,
        email: true,
        registerno: true,
        department: true,
        year: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({ message: "Successfully fetched", students });

  } catch (error) {
    console.error("Fetch students error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  get_student,
  add_student
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const add_student = async (req,res) => {
    const {name,email,registerno,department,year,}=res.body;
}
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
  get_student
};

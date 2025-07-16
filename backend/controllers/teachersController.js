const prisma = require('../prisma')


// Add Student
const add_student = async (req, res) => {
  const { name, email, registerno, department, year } = req.body;

  if (!name || !email || !registerno || !department || !year) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { registerno }]
      }
    });

    if (existing) {
      return res.status(409).json({ message: "Student with this email or register number already exists" });
    }

    const student = await prisma.student.create({
      data: { name, email, registerno, department, year }
    });

    return res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get All Students
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
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ message: "Successfully fetched", students });
  } catch (error) {
    console.error("Fetch students error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update Student
const update_student = async (req, res) => {
  const { id, name, email, registerno, department, year } = req.body;

  if (!id || !name || !email || !registerno || !department || !year) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: { name, email, registerno, department, year }
    });

    return res.status(200).json({ message: "Student updated successfully", student: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete Student
const delete_student = async (req, res) => {
  const { id } = req.body;

  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await prisma.student.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Add Teacher
const add_teacher = async (req, res) => {
  const {
    name,
    email,
    password,
    institution,
    department,
    position,
    phone,
    office,
    bio,
    specialization,
    qualifications,
    professional_experience
  } = req.body;

  if (!name || !email || !password || !institution || !department || !position || !phone || !office || !bio || !specialization || !qualifications || !professional_experience) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await prisma.teacher.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({ message: "Teacher with this email already exists" });
    }

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password,
        institution,
        department,
        position,
        phone,
        office,
        bio,
        specialization,
        qualifications,
        professional_experience
      }
    });

    return res.status(201).json({ message: "Teacher created successfully", teacher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Teacher Profile by Email
const getTeacherProfile = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found with this email" });
    }

    return res.status(200).json({ message: "Fetched successfully", teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update Teacher Profile
const updateTeacherProfile = async (req, res) => {
  const { id } = req.body;
  const {
    name,
    email,
    institution,
    department,
    position,
    phone,
    office,
    bio,
    specialization,
    qualifications,
    professional_experience
  } = req.body;

  if (!name || !email || !institution || !department || !position || !phone || !office || !bio || !specialization || !qualifications || !professional_experience) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await prisma.teacher.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return res.status(404).json({ message: "Teacher does not exist" });
    }

    const updated = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        institution,
        department,
        position,
        phone,
        office,
        bio,
        specialization,
        qualifications,
        professional_experience
      }
    });

    return res.status(200).json({ message: "Teacher updated successfully", teacher: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


module.exports = {
  get_student,
  add_student,
  update_student,
  delete_student,
  add_teacher,
  getTeacherProfile,
  updateTeacherProfile
};

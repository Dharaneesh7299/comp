const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// CREATE TEAM
const createTeam = async (req, res) => {
  const {
    name,
    competitionId,
    motive,
    experience_level,
    certifacte,
    memberRegisterNumbers
  } = req.body;

  try {
    const students = await prisma.student.findMany({
      where: { registerno: { in: memberRegisterNumbers } }
    });

    if (students.length !== memberRegisterNumbers.length) {
      return res.status(400).json({
        message: 'Some registration numbers were not found',
        found: students.map((s) => s.registerno)
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        competitionId: Number(competitionId),
        motive,
        experience_level,
        certifacte,
        members: {
          create: students.map((student, index) => ({
            studentId: student.id,
            role: index === 0 ? 'LEADER' : 'DEVELOPER'
          }))
        }    
      },
      include: {
        members: {
          include: { student: true }
        }
      }
    });

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getAllTeams = async (req, res) => {
  const { studentId } = req.query;

  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            studentId: Number(studentId)
          }
        }
      },
      include: {
        competition: true,
        members: {
          include: { student: true }
        }
      }
    });

    res.status(200).json({ message: 'Teams fetched successfully', teams });
  } catch (error) {
    console.error('Fetch teams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE TEAM
const updateTeam = async (req, res) => {
  const {
    id,
    name,
    competitionId,
    status,
    motive,
    experience_level,
    certifacte
  } = req.body;

  try {
    const updatedTeam = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name,
        competitionId: Number(competitionId),
        status,
        motive,
        experience_level,
        certifacte
      }
    });

    res.status(200).json({ message: 'Team updated successfully', team: updatedTeam });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE TEAM
const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.teamMember.deleteMany({ where: { teamId: Number(id) } });
    await prisma.team.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam
};

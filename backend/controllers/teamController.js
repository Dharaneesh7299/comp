const prisma = require('../prisma')
const sharp = require('sharp')
const supabase = require('../utils/supabaseClient')

const path = require("path");

function generateSafeFilename(originalName) {
  const timestamp = Date.now();
  const ext = path.extname(originalName); // e.g. ".png"
  const nameWithoutExt = path.basename(originalName, ext);
  const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // replaces unsafe chars
  return `certificates/${timestamp}_${safeName}${ext}`;
}


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

  if (
    !name ||
    !competitionId ||
    !motive ||
    !experience_level ||
    !Array.isArray(memberRegisterNumbers) ||
    memberRegisterNumbers.length === 0
  ) {
    return res.status(400).json({
      message: 'Missing required fields: name, competitionId, motive, experience_level, or memberRegisterNumbers'
    });
  }

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
        members: { include: { student: true } },
        competition: true
      }
    });

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL TEAMS FOR A STUDENT
const getAllTeams = async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId query parameter is required' });
  }

  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { studentId: Number(studentId) }
        }
      },
      include: {
        competition: true,
        members: { include: { student: true } }
      },
      orderBy : {createdAt : "desc"}
    });

    res.status(200).json({ message: 'Teams fetched successfully', teams });
  } catch (error) {
    console.error('Fetch teams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE TEAM DETAILS
const updateTeam = async (req, res) => {
  const {
    id,
    name,
    competitionId,
    motive,
    experience_level,
    certificate,
    memberRegisterNumbers
  } = req.body;

  if (
    !id ||
    !name ||
    !competitionId ||
    !motive ||
    !experience_level ||
    !Array.isArray(memberRegisterNumbers) ||
    memberRegisterNumbers.length === 0
  ) {
    return res.status(400).json({
      message: 'Missing required fields: id, name, competitionId, motive, experience_level, or memberRegisterNumbers'
    });
  }

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

    const teamId = Number(id);

    const updatedTeam = await prisma.$transaction(async (tx) => {
        await tx.teamMember.deleteMany({ where: { teamId } });

        await tx.team.update({
          where: { id: teamId },
          data: {
            name,
            motive,
            experience_level,
            certifacte : certificate,
            competition: {
              connect: { id: Number(competitionId) }
            }
          }
        });

        await tx.teamMember.createMany({
          data: students.map((student, index) => ({
            teamId,
            studentId: student.id,
            role: index === 0 ? 'LEADER' : 'DEVELOPER'
          }))
        });

        return tx.team.findUnique({
          where: { id: teamId },
          include: {
            members: { include: { student: true } },
            competition: true
          }
        });
      });


          res.status(200).json({ message: 'Team updated successfully', team: updatedTeam });
        } catch (error) {
          console.error('Update team error:', error);
          res.status(500).json({ message: 'Server error', error: error.message });
        }
      };

// UPDATE TEAM STATUS
const updateTeamStatus = async (req, res) => {
  const { teamId, status } = req.body;

  if (!teamId || !status) {
    return res.status(400).json({ message: 'Team ID and status are required' });
  }

  try {
    const existing = await prisma.team.findUnique({
      where: { id: Number(teamId) }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (status === 'REJECTED' || status === 'WON') {
      await prisma.team.update({
        where: { id: Number(teamId) },
        data: { del_status: 'OFFLINE' }
      });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: Number(teamId) },
      data: { status }
    });

    res.status(200).json({
      message: 'Team status updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE TEAM
const deleteTeam = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Team ID is required' });
  }

  try {
    const teamId = Number(id);
    await prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { teamId } }),
      prisma.team.delete({ where: { id: teamId } })
    ]);

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//team count , total members , active teams  ,leading
const stdteam_data = async (req,res) =>{
  const {id} = req.body;

  if (!id){
    return res.status(404).json({message : "provide the id"});
  }

  try {

    const t_count = await prisma.team.count ({
      where: {
        members: {
          some: { studentId: Number(id) }
        }
      }
    });

    const active_teams = await prisma.team.count ({
      where : {
        del_status : "ONLINE" ,
        members : {
          some : {
            studentId : id
          }
        }
      }
    });

    const lead_teams = await prisma.team.count ({
      where : {
        members : {
          some : {
            studentId : id,
            role : "LEADER",
          }
        }
      }
    });

    const mem_count = await prisma.teamMember.count({
      where: {
        team: {
          members: {
            some: {
              studentId: parseInt(id),
            },
          },
        },
        studentId: {
          not: parseInt(id),
        },
      },
    });

    return res.status(200).json({message : "fetched successfully" ,  data : {t_count , active_teams, lead_teams , mem_count}});

  }
  catch (error) {
    console.error(error);
    return res.status(500).json(({message : "internal server error" , error : error.message}));
  }
}

//reg , short , won , total
const dash_data = async (req,res) => {
  const {id} = req.body;

  try {

    const reg_count = await prisma.team.count ({
      where: {
        members: {
          some: { 
            studentId: Number(id),
          }
        }
      }
    });

    const active_teams = await prisma.team.count ({
      where : {
        members : {
          some : {
            studentId : id
          }
        }
      }
    });

    const short_count = await prisma.team.count ({
      where: {
        status : "SHORTLISTED",
        members: {
          some: { studentId: Number(id) }
        }
      }
    });

    const won_count = await prisma.team.count ({
      where: {
        status : "WON",
        members: {
          some: { studentId: Number(id) }
        }
      }
    });

    return res.status(200).json({message : "fetched successfully" ,  data : {reg_count , active_teams, short_count , won_count}});
  }
  catch (error) {
    console.error(error);
    return res.status(500).json(({message : "internal server error" , error : error.message}));
  }
}

// certificate uploading using supabse

const upload_cert = async (req, res) => {
  const { id } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { originalname, mimetype, buffer } = req.file;
  const fileName = generateSafeFilename(originalname);

  try {

    // Step 1: Compress image to be under 50 KB
    let compressedBuffer = await sharp(buffer)
      .resize({ width: 800 }) // Optional: resize width to reduce size
      .jpeg({ quality: 70 })  // Adjust quality to reduce size
      .toBuffer();

    // Ensure it's < 50 KB
    while (compressedBuffer.length > 50 * 1024) {
      compressedBuffer = await sharp(compressedBuffer)
        .jpeg({ quality: 60 }) // keep lowering quality
        .toBuffer();

      if (compressedBuffer.length < 50 * 1024) break;
    }

    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicURLData } = supabase
      .storage
      .from('certificates')
      .getPublicUrl(fileName);

    const imageURL = publicURLData.publicUrl;

    const updated = await prisma.team.update({
      where: { id: Number(id) },
      data: { certifacte: imageURL },
    });

    return res.status(200).json({ message: "Certificate uploaded", url: imageURL, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};




module.exports = {
  createTeam,
  getAllTeams,
  updateTeam,
  updateTeamStatus,
  deleteTeam,
  stdteam_data,
  dash_data,
  upload_cert
};

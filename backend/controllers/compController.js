const prisma = require('../prisma')

// Add competition
const add_comp = async (req, res) => {
  const { name, url, about, category, status, startdate, enddate, deadline, location, team_size, prize_pool, priority } = req.body;

  if (!name || !url || !category || !status || !startdate || !about || !enddate || !deadline || !location || !team_size || !prize_pool || !priority) {
    return res.status(400).json({ message: "Provide all the fields" });
  }

  try {
    const existing = await prisma.competition.findFirst({
      where: { url },
    });

    if (existing) {
      return res.status(400).json({ message: "Competition with this URL already exists" });
    }

    const create_comp = await prisma.competition.create({
      data: {
        name,
        url,
        about,
        category,
        status: status.toUpperCase(),
        startdate: new Date(startdate),
        enddate: new Date(enddate),
        deadline: new Date(deadline),
        location,
        team_size: Number(team_size),
        prize_pool: Number(prize_pool),
        priority: priority.toUpperCase(),
      },
    });

    return res.status(200).json({ message: "Created successfully", create_comp });
  } catch (error) {
    console.error("Error in add_comp:", {
      message: error.message,
    });
    if (error.code === 'P2021') {
      return res.status(500).json({ message: "Database table not found. Please check schema configuration." });
    }
    return res.status(500).json({ message: "Failed to create competition", error: error.message });
  }
};

// Update competition
const update_comp = async (req, res) => {
  const { id, name, url, about, category, status, startdate, enddate, deadline, location, team_size, prize_pool, priority } = req.body;

  if (!id || !name || !url || !category || !status || !startdate || !about || !enddate || !deadline || !location || !team_size || !prize_pool || !priority) {
    return res.status(400).json({ message: "Provide all the fields" });
  }

  try {
    const existing = await prisma.competition.findFirst({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "No competition found" });
    }

    const update = await prisma.competition.update({
      where: { id: Number(id) },
      data: {
        name,
        url,
        about,
        category,
        status: status.toUpperCase(),
        startdate: new Date(startdate),
        enddate: new Date(enddate),
        deadline: new Date(deadline),
        location,
        team_size: Number(team_size),
        prize_pool: Number(prize_pool),
        priority: priority.toUpperCase(),
      },
    });

    return res.status(200).json({ message: "Updated successfully", update });
  } catch (error) {
    console.error("Error in update_comp:", {
      message: error.message,
    });
    if (error.code === 'P2021') {
      return res.status(500).json({ message: "Database table not found. Please check schema configuration." });
    }
    return res.status(500).json({ message: "Failed to update competition", error: error.message });
  }
};

// Delete competition (soft delete)
const delete_comp = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Provide id" });
  }

  try {
    const existing = await prisma.competition.findFirst({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const del_comp = await prisma.competition.update({
      where: { id: Number(id) },
      data: { status: "COMPLETED" },
    });

    return res.status(200).json({ message: "Deleted successfully", del_comp });
  } catch (error) {
    console.error("Error in delete_comp:", {
      message: error.message,
    });
    if (error.code === 'P2021') {
      return res.status(500).json({ message: "Database table not found. Please check schema configuration." });
    }
    return res.status(500).json({ message: "Failed to delete competition", error: error.message });
  }
};

// Get competitions
const get_comp = async (req, res) => {
  try {
    const g_comp = await prisma.competition.findMany({
      where : {  NOT : {status : "COMPLETED"} },
      include: {
        _count: {
          select: { teams: true },
        },
      },
      orderBy: { deadline: 'desc' },
    });

    res.set('Cache-Control', 'no-cache');
    return res.status(200).json({ message: "Fetched successfully", g_comp });
  } catch (error) {
    console.error("Error in get_comp:", {
      message: error.message,
    });
    if (error.code === 'P2021') {
      return res.status(500).json({ message: "Database table not found. Please check schema configuration." });
    }
    return res.status(500).json({ message: "Failed to fetch competitions", error: error.message });
  }
};

//get comp with id

const comp_id = async (req,res)=>{
    const {id} = req.body;

    try{

      if (!id){
        return res.status(404).json({message : "provide id"});
      }

      const g_comp_id = await prisma.competition.findMany({
        where : {id}
      });

      if (!g_comp_id){
        return res.status(404).json({message : "competition not found"});
      }

      return res.status(200).json({message : "fetched successfully" , data : g_comp_id});
    }
    catch(error){
      console.error(error);
      return res.status(500).json({message : "inetrnal server error" , error : error.message});
    }
}



module.exports = {
  add_comp,
  update_comp,
  delete_comp,
  get_comp,
  comp_id
};
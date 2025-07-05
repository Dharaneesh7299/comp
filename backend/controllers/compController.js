const { PrismaClient } = require('../generated/prisma'); 
const prisma = new PrismaClient();

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
                status,
                startdate,
                enddate,
                deadline,
                location,
                team_size,
                prize_pool,
                priority
            }
        });

        return res.status(200).json({ message: "Created successfully", create_comp });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
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
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "No competition found" });
        }

        const update = await prisma.competition.update({
            where: { id },
            data: {
                name,
                url,
                about,
                category,
                status,
                startdate,
                enddate,
                deadline,
                location,
                team_size,
                prize_pool,
                priority
            }
        });

        return res.status(200).json({ message: "Updated successfully", update });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    add_comp,
    update_comp
};

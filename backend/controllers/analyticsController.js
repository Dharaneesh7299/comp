const { PrismaClient } = require('../generated/prisma'); 
const prisma = new PrismaClient();


//getting the initail count data
const int_data = async (req, res) => {

    try {
        const [
            comp_count,
            std_count,
            reg_count,
            act_comp,
            shortlisted_cnt,
            won_cnt,
            registered_cnt,
            rejected_cnt
        ] = await Promise.all([
            prisma.competition.count(),
            prisma.student.count(),
            prisma.team.count(),
            prisma.competition.count({ where: { status: "ONGOING" } }),
            prisma.team.count({ where: { status: "SHORTLISTED" } }),
            prisma.team.count({ where: { status: "WON" } }),
            prisma.team.count({ where: { status: "REGISTERED" } }),
            prisma.team.count({ where: { status: "REJECTED" } })
        ]);

        return res.status(200).json({
            message: "fetched successfully",
            data: {
                comp_count,
                std_count,
                act_comp,
                reg_count,
                shortlisted_cnt,
                won_cnt,
                registered_cnt,
                rejected_cnt
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
};


//fetching the each ctaegory registered with the count
const category_count = async (req,res) => {

    try {

        const dta  = await prisma.competition.groupBy({
            by : ['category'] ,
            _count : {
                category : true,
            },
        });

        const out_data = dta.map( item => ({
            category : item.category,
            count : item._count.category,
        }));

        return res.status(200).json({message : "fetched succesfully" , out_data});
    }

    catch (error) {
        console.error(error);
        return res.status(500).json({message : "internal server error" , error : error.message});
    }

}

// month wise registration use raw query used chat gpt

const month_count = async (req,res) => {

    try {

        const registrationsByMonth = await prisma.$queryRaw`
            WITH months AS (
                SELECT to_char(date_trunc('month', CURRENT_DATE) - (interval '1 month' * generate_series(0, 5)), 'Mon') AS month,
                    EXTRACT(MONTH FROM date_trunc('month', CURRENT_DATE) - (interval '1 month' * generate_series(0, 5))) AS month_num,
                    date_trunc('month', CURRENT_DATE) - (interval '1 month' * generate_series(0, 5)) AS month_start
            ),
            registrations AS (
                SELECT 
                date_trunc('month', "createdAt") AS month_start,
                COUNT(*) AS count
                FROM "Team"
                WHERE status = 'REGISTERED' AND "createdAt" >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY month_start
            )
            SELECT 
                m.month,
                m.month_num,
                COALESCE(r.count, 0)::int AS count
            FROM months m
            LEFT JOIN registrations r ON m.month_start = r.month_start
            ORDER BY m.month_start;
            `;
        
        return res.status(200).json({message : "fetched successfully" , data : registrationsByMonth})
    }
    
    catch (error) {
        console.error(error);
        return res.status(500).json({message : "internal server error" , error : error.message});
    }

};

//selecting the most registered comp
const most_reg = async (req,res) => {

    try {
        const most_one = await prisma.competition.findMany({
            select : {
                id : true,
                name : true,
                category : true,
                status : true,
                prize_pool : true,
                _count : {
                    select : {
                        teams : true
                    }
                }
            },
            orderBy : {
                teams: {
                    _count: 'desc'
                },
            },
            take : 5
        });

        return res.status(200).json({message : "fetched successfully" , data : most_one});
    }

    catch (error) {
        console.error(error);
        return res.status(500).json({message : "internal server error" , error : error.message});
    }
}

module.exports = { 
    int_data ,
    category_count,
    month_count,
    most_reg
};

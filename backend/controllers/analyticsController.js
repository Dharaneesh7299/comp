const prisma = require('../prisma')


//getting the initail count data
const int_data = async (req, res) => {
  try {
    console.log('Fetching analytics data...');

    const comp_count = await prisma.competition.count();
    const std_count = await prisma.student.count();
    const reg_count = await prisma.team.count();
    const act_comp = await prisma.competition.count({ where: { status: 'ONGOING' } });

    const shortlisted_cnt = await prisma.team.count({
      where: { status: 'SHORTLISTED' },
    }).catch((err) => {
      console.error('Error counting SHORTLISTED teams:', err);
      throw new Error('Failed to count SHORTLISTED teams');
    });

    const won_cnt = await prisma.team.count({
      where: { status: 'WON' },
    }).catch((err) => {
      console.error('Error counting WON teams:', err);
      throw new Error('Failed to count WON teams');
    });

    const registered_cnt = await prisma.team.count({
      where: { status: 'REGISTERED' },
    }).catch((err) => {
      console.error('Error counting REGISTERED teams:', err);
      throw new Error('Failed to count REGISTERED teams');
    });

    const rejected_cnt = await prisma.team.count({
      where: { status: 'REJECTED' },
    }).catch((err) => {
      console.error('Error counting REJECTED teams:', err);
      throw new Error('Failed to count REJECTED teams');
    });

    return res.status(200).json({
      message: 'fetched successfully',
      data: {
        comp_count,
        std_count,
        act_comp,
        reg_count,
        shortlisted_cnt,
        won_cnt,
        registered_cnt,
        rejected_cnt,
      },
    });
  } catch (error) {
    console.error('Error in int_data:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: 'internal server error',
      error: error.message,
    });
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
const month_count = async (req, res) => {
  try {
    const registrationsByMonth = await prisma.$queryRaw`
      WITH months AS (
        SELECT 
          to_char(
            date_trunc('month', CURRENT_DATE - (interval '1 month' * generate_series(0, 5))),
            'Mon'
          ) AS month,
          date_trunc('month', CURRENT_DATE - (interval '1 month' * generate_series(0, 5))) AS month_start
      ),
      registrations AS (
        SELECT 
          date_trunc('month', "createdAt") AS month_start,
          COUNT(*) AS count
        FROM "Team"
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY month_start
      )
      SELECT 
        m.month,
        COALESCE(r.count, 0)::int AS count
      FROM months m
      LEFT JOIN registrations r ON m.month_start = r.month_start
      ORDER BY m.month_start ASC;
    `;

    return res.status(200).json({
      message: "fetched successfully",
      data: registrationsByMonth,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};


//no of comp added this month
const comp_count = async (req,res)=>{
    try {

        const currentMonthCompetitions = await prisma.$queryRaw`
        SELECT 
          COUNT(*)::int AS count
        FROM "Competition"
        WHERE "createdAt" >= date_trunc('month', CURRENT_DATE)
          AND "createdAt" < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
      `;

      const count = currentMonthCompetitions[0]?.count || 0;

      return res.status(200).json({ message: "fetched successfully", data: count});
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message : "internal server error" , error : error.message})
    }
}

//student count this month
const std_count = async(req,res)=>{
    try {
        const currentstudentregistrations = await prisma.$queryRaw`
        SELECT 
          COUNT(*)::int AS count
        FROM "Student"
        WHERE "createdAt" >= date_trunc('month', CURRENT_DATE)
          AND "createdAt" < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
        `;

        const count = currentstudentregistrations[0]?.count || 0;

        return res.status(200).json({ message: "fetched successfully", data: count});
    }
    catch (error) {
        console.error(error);
        return res.status(500).jaon({message : "internal server error" , error : error.message});
    }
}

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

//dahsboard recent competitons
const recent_comp = async (req, res) => {
  try {
    const rec_comp = await prisma.competition.findMany({
      where: {
        NOT: {
          status: "COMPLETED",
        },
      },
      include: {
        _count: {
          select: { teams: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    const competitionsWithStats = await Promise.all(
      rec_comp.map(async (comp) => {
        const s_cnt = await prisma.team.count({
          where: {
            competitionId: comp.id,
            status: "SHORTLISTED",
          },
        }).catch((err) => {
          console.error(`Error counting SHORTLISTED teams for competition ${comp.id}:`, err)
          return 0 
        })

        const w_cnt = await prisma.team.count({
          where: {
            competitionId: comp.id,
            status: "WON",
          },
        }).catch((err) => {
          console.error(`Error counting WON teams for competition ${comp.id}:`, err)
          return 0 
        })

        return {
          ...comp,
          stats: {
            total: comp._count.teams,
            shortlisted: s_cnt,
            won: w_cnt,
          },
          _count: undefined, // Remove _count from response to clean up
        }
      })
    )

    return res.status(200).json({
      message: "fetched successfully",
      data: competitionsWithStats,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    })
  }
}

//recent team registrations
const rec_reg = async (req,res) => {
  try {
    const r_team = await prisma.team.findMany({
      orderBy  : {
        createdAt : 'desc',
      },
      select : {
        id : true,
        name : true,
        createdAt : true,
        competition : {
          select : {
            name : true,
            status : true,
          }
        }
      },
      take : 5,
    }); 
    
    return res.status(200).json({message : "fetched successfully" , data : r_team});

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
    most_reg,
    recent_comp,
    comp_count,
    std_count,
    rec_reg
};

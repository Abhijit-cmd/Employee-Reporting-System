const prisma = require("../prisma/prismaClient");


// CREATE REPORT

exports.createReport = async (req, res) => {

  try {

    const report = await prisma.report.create({

      data: {

        userId: req.body.userId,

        reportMonth: req.body.reportMonth,

        reportYear: new Date(req.body.reportYear),

        customersRegistered:
        req.body.customersRegistered,

        suppliersRegistered:
        req.body.suppliersRegistered,

        newBrandProducts:
        req.body.newBrandProducts,

        successStories:
        req.body.successStories,

        websiteVisitors:
        req.body.websiteVisitors,

        customerChallenges:
        req.body.customerChallenges,

        supplierChallenges:
        req.body.supplierChallenges,

        logisticsChallenges:
        req.body.logisticsChallenges,

        financeChallenges:
        req.body.financeChallenges,

        individualMetrics:
        req.body.individualMetrics,

        ytdAchievement:
        req.body.ytdAchievement,

        targetVsAchievement:
        req.body.targetVsAchievement,

        topAccomplishments:
        req.body.topAccomplishments,

        strengthsComments:
        req.body.strengthsComments

      }

    });

    res.status(201).json({

      message: "Report submitted successfully",

      report

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};




// GET ALL REPORTS

exports.getReports = async (req, res) => {

  try {

    const reports = await prisma.report.findMany({

      include: {
        user: true
      }

    });

    res.status(200).json(reports);

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};
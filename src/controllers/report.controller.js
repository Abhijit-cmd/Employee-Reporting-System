const prisma =
  require("../prisma/prismaClient");


// CREATE REPORT
exports.createReport = async (
  req,
  res
) => {

  try {

    const submittedStatus =
      await prisma.reportStatus.findFirst({
        where: { statusName: "Submitted" },
      });

    const report =
      await prisma.report.create({

        data: {

          mmyyyy:
            req.body.mmyyyy,

          businessOwner:
            req.body.businessOwner,

          preparedBy:
            req.body.preparedBy,

          reviewedBy:
            req.body.reviewedBy,

          customersRegistered:
            Number(
              req.body.customersRegistered
            ),

          suppliersRegistered:
            Number(
              req.body.suppliersRegistered
            ),

          newBrandProducts:
            Number(
              req.body.newBrandProducts
            ),

          successStories:
            Number(
              req.body.successStories
            ),

          websiteVisitors:
            Number(
              req.body.websiteVisitors
            ),

          challenges:
            req.body.challenges,

          salesBooking:
            req.body.salesBooking,

          targetVsAchievement:
            req.body.targetVsAchievement,

          accomplishments:
            req.body.accomplishments,

          user: {
            connect: {
              id: req.user.id,
            },
          },

          reportStatus: {
            connect: {
              id: submittedStatus.id,
            },
          },

        },

      });

    res.status(201).json({
      message:
        "Report created successfully",
      report,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};


// GET REPORTS
exports.getReports = async (
  req,
  res
) => {

  try {

    const reports =
      await prisma.report.findMany({

        include: {

          user: true,

          reportStatus: true,

        },

        orderBy: {
          createdAt: "desc",
        },

      });

    res.status(200).json(
      reports
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

exports.getMyReports = async (
  req,
  res
) => {

  try {

    const reports =
      await prisma.report.findMany({

        where: {
          userId: req.user.id,
        },

        include: {

          reportStatus: true,

        },

        orderBy: {
          createdAt: "desc",
        },

      });

    res.status(200).json(
      reports
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });

  }

};
const prisma =
  require("../prisma/prismaClient");

exports.createReport = async (
  req,
  res
) => {

  try {

    const report = await prisma.report.create({

  data: {

    mmyyyy: req.body.mmyyyy,

    businessOwner: req.body.businessOwner,

    preparedBy: req.body.preparedBy,

    reviewedBy: req.body.reviewedBy,

    customersRegistered: Number(req.body.customerReg),

    suppliersRegistered: Number(req.body.supplierReg),

    newBrandProducts: Number(req.body.productsAdded),

    successStories: Number(req.body.successStories),

    websiteVisitors: Number(req.body.siteVisits),

    challenges: req.body.challenges,

    salesBooking: req.body.salesBooking,

    targetVsAchievement:
      req.body.targetVsAchievement,

    accomplishments:
      req.body.accomplishments,

    reportStatus: {
      connect: {
        id: 1

      }
    },

    user: {
      connect: {
        id: req.user.id
      }
    }

  },

});

    res.status(201).json({
      message:
        "Report created successfully",
      report,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
    message: error.message,
    error,
  });


  }

};
const prisma = require("../../prisma/prismaClient");

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!body?.trim()) return res.status(400).json({ message: "Body is required" });

    const announcement = await prisma.announcement.create({
      data: { title: title.trim(), body: body.trim(), createdBy: req.user.id },
      include: { author: { select: { name: true } } },
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await prisma.announcement.delete({ where: { id } });
    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

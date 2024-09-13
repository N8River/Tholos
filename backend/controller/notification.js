const Notification = require("../model/notification");

exports.unreadNotification = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

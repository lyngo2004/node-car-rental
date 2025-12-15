const {
    fetchAllRentalsService,
    fetchRentalsByStatusService,
    fetchRentalSummaryService,
    fetchRentalByIdService,
    approveRentalService,
    rejectRentalService,
    cancelRentalService,
} = require("../../services/rentalService");

const fetchAllRentalsController = async (req, res) => {
    const { status } = req.query;

    // Không có status → get all
    if (!status) {
        const data = await fetchAllRentalsService();
        return res.status(200).json(data);
    }

    // Có status → filter
    const data = await fetchRentalsByStatusService(status);
    return res.status(200).json(data);
};

const fetchRentalSummaryController = async (req, res) => {
    const data = await fetchRentalSummaryService();
    return res.status(200).json(data);
};

const fetchRentalByIdController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing rental id",
      DT: null,
    });
  }

  const data = await fetchRentalByIdService(id);
  return res.status(200).json(data);
};

const approveRentalController = async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId; // lấy từ JWT

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing rental id",
      DT: null,
    });
  }

  const data = await approveRentalService(id, adminUserId);
  return res.status(200).json(data);
};

const rejectRentalController = async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId;

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing rental id",
      DT: null,
    });
  }

  const data = await rejectRentalService(id, adminUserId);
  return res.status(200).json(data);
};

const cancelRentalController = async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user?.userId;

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing rental id",
      DT: null,
    });
  }

  const data = await cancelRentalService(id, adminUserId);
  return res.status(200).json(data);
};

module.exports = {
    fetchAllRentalsController,
    fetchRentalSummaryController,
    fetchRentalByIdController,
    approveRentalController,
    rejectRentalController,
    cancelRentalController
};
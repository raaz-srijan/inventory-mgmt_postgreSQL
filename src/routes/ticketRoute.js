const express = require("express");
const { createTicket, getTickets, updateTicketStatus } = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", checkPermission("report_bugs"), createTicket);
router.get("/", checkPermission("fix_bugs"), getTickets); // fix_bugs is an admin/super_admin permission, but wait
// Owners also need to see their own tickets. I'll use a generic permission or handled in controller.
router.get("/my-tickets", getTickets);
router.patch("/:id", checkPermission("fix_bugs"), updateTicketStatus);

module.exports = router;

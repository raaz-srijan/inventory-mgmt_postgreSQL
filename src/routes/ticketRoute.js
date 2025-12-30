const express = require("express");
const { createTicket, getTickets, updateTicketStatus } = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTicket);

router.get("/all", checkPermission("fix_bugs", "PLATFORM"), getTickets);

router.get("/", getTickets);

router.patch("/:id", checkPermission("fix_bugs", "PLATFORM"), updateTicketStatus);

module.exports = router;

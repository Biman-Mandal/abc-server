import { Router } from "express";
import { auth } from "../middleware/auth";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { createSupportTicket, getUserTickets, getAllTicketsForAdmin, replyToTicket } from "../controllers/support.controller";

const router = Router();

// User route
router.post('/create', auth, createSupportTicket);
router.get('/my-tickets', auth, getUserTickets);

// Admin route
router.get('/admin/all', verifyAdmin, getAllTicketsForAdmin);
router.post('/admin/reply/:ticketId', verifyAdmin, replyToTicket);

export default router;
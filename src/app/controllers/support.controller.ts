import { Request, Response, NextFunction } from "express";
import SupportTicket from "../models/support.model";


export const createSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rideId, subject, description, category } = req.body;
        const currentUser = req.user as { _id: any };

        const newTicket = await SupportTicket.create({
            userId: currentUser._id,
            rideId,
            subject,
            description,
            category,
            messages: [{ sender: currentUser._id, message: description, timestamp: new Date() }]
        });
        
        res.status(201).json({ success: true, message: "Support ticket created. We will get back to you soon.", data: newTicket });
        return;
    } catch (error) {
        next(error);
    }
};

export const getUserTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = req.user as { _id: any };
        const tickets = await SupportTicket.find({ userId: currentUser._id }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: tickets });
        return;
    } catch (error) {
        next(error);
    }
};

export const getAllTicketsForAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await SupportTicket.find().populate('userId', 'name').sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: tickets });
        return;
    } catch (error) {
        next(error);
    }
};

export const replyToTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;
        const currentUser = req.user as { _id: any };

        const ticket = await SupportTicket.findByIdAndUpdate(
            ticketId,
            {
                $push: { messages: { sender: currentUser._id, message: message, timestamp: new Date() } },
                status: "in_progress",
            },
            { new: true }
        );

        if(!ticket) {
            res.status(404).json({ success: false, message: "Ticket not found." });
            return;
        }

        res.status(200).json({ success: true, message: "Reply sent.", data: ticket });
        return;
    } catch (error) {
        next(error);
    }
};
const express = require('express');
const { Ticket, User, TicketComment } = require('../models');
const { Op } = require('sequelize');

const { protect, requireRole } = require('../middleware/authMiddleware');
const { validateTicket, validatePagination } = require('../middleware/validation');
const { paginate, buildPaginatedResponse } = require('../utils/pagination');

const {
  categorizeTicket,
  predictUrgency,
  routeTicketToDepartment
} = require('../utils/mlService');

const {
  createNotification,
  notifyTicketAssignment,
  notifyStatusChange
} = require('../utils/notificationService');

const router = express.Router();


// ======================
// CREATE TICKET
// ======================
router.post('/', protect, requireRole('student'), validateTicket, async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const finalCategory = category || categorizeTicket(title, description);
    const urgency = predictUrgency(title, description, finalCategory);
    const department = routeTicketToDepartment(finalCategory);

    const ticket = await Ticket.create({
      title,
      description,
      category: finalCategory,
      urgency,
      department,
      studentId: req.user.id,
      status: 'open'
    });

    await createNotification(
      req.user.id,
      ticket.id,
      'ticket_created',
      'Ticket Created',
      `Your ticket "${title}" has been created.`,
      false
    );

    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdTicket
    });

  } catch (err) {
    console.error('Create ticket error:', err);
    next(err);
  }
});


// ======================
// GET TICKETS
// ======================
router.get('/', protect, validatePagination, async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const { skip, limit } = paginate(req.pagination.page, req.pagination.limit);
    const { status, priority, sortBy } = req.query;

    let where = {};

    if (role === 'student') {
      where.studentId = id;
    }

    if (role === 'staff') {
      where = {
        [Op.or]: [
          { assignedToId: id },
          { status: 'open' }
        ]
      };
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    let orderBy = [['createdAt', 'DESC']];

    if (sortBy === 'urgency') {
      orderBy = [['urgency', 'DESC']];
    }

    if (sortBy === 'priority') {
      orderBy = [['priority', 'DESC']];
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      order: orderBy,
      offset: skip,
      limit,
      include: [
        {
          model: User,
          as: 'student',
          attributes: [
            'id',
            'name',
            'email',
            'yearOfStudy',
            'school',
            'admissionNumber'
          ]
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TicketComment,
          as: 'comments',
          separate: true,
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    const response = buildPaginatedResponse(
      rows,
      count,
      req.pagination.page,
      req.pagination.limit
    );

    res.json({
      success: true,
      ...response
    });

  } catch (err) {
    console.error('Ticket fetch error:', err);
    next(err);
  }
});


// ======================
// GET SINGLE TICKET
// ======================
router.get('/:id', protect, async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TicketComment,
          as: 'comments',
          separate: true,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'role']
            }
          ]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (
      req.user.role === 'student' &&
      ticket.studentId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (err) {
    console.error('Single ticket error:', err);
    next(err);
  }
});


// ======================
// ADD COMMENT
// ======================
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const { comment, isInternal } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const newComment = await TicketComment.create({
      ticketId: ticket.id,
      userId: req.user.id,
      comment,
      isInternal: isInternal || false
    });

    const fullComment = await TicketComment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: fullComment
    });

  } catch (err) {
    console.error('Comment error:', err);
    next(err);
  }
});


// ======================
// ADMIN ASSIGNS TICKET
// ======================
router.put('/:id/assign', protect, requireRole('admin'), async (req, res) => {
  try {
    const { assignedToId } = req.body;

    if (!assignedToId) {
      return res.status(400).json({
        success: false,
        message: 'assignedToId is required'
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const staff = await User.findOne({
      where: {
        id: assignedToId,
        role: 'staff'
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff user not found'
      });
    }

    ticket.assignedToId = assignedToId;
    ticket.status = 'in progress';

    await ticket.save();

    try {
      await notifyTicketAssignment(ticket, staff.name);
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedTicket
    });

  } catch (err) {
    console.error('Assign ticket error:', err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================
// STAFF CLAIM TICKET
// ======================
router.put('/:id/claim', protect, requireRole('staff'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.assignedToId && ticket.assignedToId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already claimed'
      });
    }

    ticket.assignedToId = req.user.id;

    if (ticket.status === 'open') {
      ticket.status = 'in progress';
    }

    await ticket.save();

    res.json({
      success: true,
      data: ticket
    });

  } catch (err) {
    console.error('Claim error:', err);
    next(err);
  }
});


// ======================
// UPDATE STATUS
// ======================
router.put('/:id/status', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const allowedStatuses = [
      'open',
      'in progress',
      'resolved',
      'closed',
      'escalated',
      'visit office'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (
      req.user.role === 'staff' &&
      ticket.assignedToId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const oldStatus = ticket.status;

    ticket.status = status;

    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    try {
      await notifyStatusChange(ticket, oldStatus, status, req.user.name);
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    if (resolution) {
      await TicketComment.create({
        ticketId: ticket.id,
        userId: req.user.id,
        comment: resolution,
        isInternal: true
      });
    }

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedTicket
    });

  } catch (err) {
    console.error('Status update error:', err);
    next(err);
  }
});


// ======================
// UPDATE PRIORITY
// ======================
router.put('/:id/priority', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { priority } = req.body;

    const allowedPriorities = [
      'low',
      'medium',
      'high',
      'critical'
    ];

    if (!priority || !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority'
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.priority = priority;

    await ticket.save();

    res.json({
      success: true,
      data: ticket
    });

  } catch (err) {
    console.error('Priority update error:', err);
    next(err);
  }
});

module.exports = router;
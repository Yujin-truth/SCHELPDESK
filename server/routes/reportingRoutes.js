const express = require('express');
const { Ticket, User, AuditLog } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Get ticket statistics (Admin/Staff only)
 */
router.get('/stats/overview', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const stats = await Ticket.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const priorityStats = await Ticket.findAll({
      attributes: [
        'priority',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    const categoryStats = await Ticket.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    const totalTickets = await Ticket.count();
    const resolvedTickets = await Ticket.count({ where: { status: 'resolved' } });
    const avgUrgency = await Ticket.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('urgency')), 'avgUrgency']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalTickets,
        resolvedTickets,
        resolutionRate: ((resolvedTickets / totalTickets) * 100).toFixed(2) + '%',
        averageUrgency: (avgUrgency.avgUrgency || 0).toFixed(2),
        byStatus: stats,
        byPriority: priorityStats,
        byCategory: categoryStats
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get staff workload statistics
 */
router.get('/stats/staff-workload', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const staffWorkload = await Ticket.findAll({
      attributes: [
        [Sequelize.col('assignedTo.id'), 'staffId'],
        [Sequelize.col('assignedTo.name'), 'staffName'],
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('Ticket.id')), 'count']
      ],
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: []
      }],
      where: { assignedToId: { [Op.not]: null } },
      group: [Sequelize.col('assignedTo.id'), Sequelize.col('assignedTo.name'), 'Ticket.status'],
      raw: true
    });

    res.json({
      success: true,
      data: staffWorkload
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get average resolution time
 */
router.get('/stats/resolution-time', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const stats = await Ticket.findAll({
      attributes: [
        'category',
        [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600')), 'avgHours'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: { 
        status: 'resolved',
        resolvedAt: { [Op.not]: null }
      },
      group: ['category'],
      raw: true
    });

    res.json({
      success: true,
      data: stats.map(s => ({
        ...s,
        avgHours: parseFloat(s.avgHours || 0).toFixed(2)
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get performance trends (monthly)
 */
router.get('/stats/trends', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const trends = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalTickets'],
        [Sequelize.fn('SUM', Sequelize.where(Sequelize.fn('CASE', Sequelize.where(Sequelize.col('status'), Op.in, ['resolved', 'closed'])), true, 1, 0)), 'resolvedTickets']
      ],
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'DESC']],
      limit: 12,
      raw: true
    });

    res.json({
      success: true,
      data: trends
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get ticket details report (filterable)
 */
router.get('/details', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const { status, priority, category, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    
    let where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get urgency distribution
 */
router.get('/stats/urgency-distribution', protect, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const distribution = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('ROUND', Sequelize.col('urgency')), 'urgencyScore'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('ROUND', Sequelize.col('urgency'))],
      order: [[Sequelize.fn('ROUND', Sequelize.col('urgency')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: distribution
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// back/controllers/supportController.js
const Ticket = require('../models/Ticket');

/**
 * @desc    Créer un nouveau ticket de support
 * @route   POST /api/support/tickets
 * @access  Private
 */
exports.createTicket = async (req, res) => {
  const { subject, message } = req.body;
  try {
    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      messages: [{ sender: 'client', content: message }],
      status: 'Ouvert',
      lastUpdate: Date.now(),
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du ticket.' });
  }
};

/**
 * @desc    Récupérer les tickets de l'utilisateur connecté
 * @route   GET /api/support/tickets
 * @access  Private
 */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ lastUpdate: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets.' });
  }
};

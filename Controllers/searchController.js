const User = require('../models/user');
const Message = require('../models/message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, conversationId, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let searchCriteria = {
      content: { $regex: query, $options: 'i' },
      deleted: false
    };

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(userId)) {
        return res.status(403).json({ error: 'Access denied to this conversation' });
      }
      searchCriteria.conversation = conversationId;
    } else {
      const userConversations = await Conversation.find({ participants: userId }).select('_id');
      const conversationIds = userConversations.map(conv => conv._id);
      searchCriteria.conversation = { $in: conversationIds };
    }

    const totalMessages = await Message.countDocuments(searchCriteria);

    const messages = await Message.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sender', 'username firstName lastName avatar')
      .populate('conversation', 'name isGroup participants')
      .populate('replyTo', 'content sender');

    const messagesByConversation = {};
    messages.forEach(message => {
      const convId = message.conversation._id.toString();
      if (!messagesByConversation[convId]) {
        messagesByConversation[convId] = {
          conversation: message.conversation,
          messages: []
        };
      }
      messagesByConversation[convId].messages.push(message);
    });

    res.json({
      query,
      results: Object.values(messagesByConversation),
      pagination: {
        total: totalMessages,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalMessages / limitNum)
      }
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchCriteria = {
      $and: [
        { _id: { $ne: currentUserId } },
        { isActive: true },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };

    const totalUsers = await User.countDocuments(searchCriteria);

    const users = await User.find(searchCriteria)
      .select('username firstName lastName avatar bio status lastSeen')
      .sort({ username: 1 })
      .skip(skip)
      .limit(limitNum);

    const usersWithConversationStatus = await Promise.all(
      users.map(async (user) => {
        const existingConversation = await Conversation.findOne({
          participants: { $all: [currentUserId, user._id] },
          isGroup: false
        });

        return {
          ...user.toObject(),
          hasConversation: !!existingConversation,
          conversationId: existingConversation?._id || null
        };
      })
    );

    res.json({
      query,
      users: usersWithConversationStatus,
      pagination: {
        total: totalUsers,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalUsers / limitNum)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error during user search' });
  }
};

// Search conversations
exports.searchConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchCriteria = {
      participants: userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'groupSettings.description': { $regex: query, $options: 'i' } }
      ]
    };

    const totalConversations = await Conversation.countDocuments(searchCriteria);

    const conversations = await Conversation.find(searchCriteria)
      .populate('participants', 'username firstName lastName avatar')
      .populate('lastMessage', 'content createdAt sender')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedConversations = conversations.map(conv => {
      let displayName = conv.name;
      if (!conv.isGroup && conv.participants.length === 2) {
        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== userId.toString()
        );
        displayName = otherParticipant ?
          (otherParticipant.firstName && otherParticipant.lastName ?
            `${otherParticipant.firstName} ${otherParticipant.lastName}` :
            otherParticipant.username) : 'Unknown User';
      }

      return {
        _id: conv._id,
        name: displayName,
        isGroup: conv.isGroup,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        avatar: conv.groupSettings?.avatar || null
      };
    });

    res.json({
      query,
      conversations: formattedConversations,
      pagination: {
        total: totalConversations,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalConversations / limitNum)
      }
    });

  } catch (error) {
    console.error('Search conversations error:', error);
    res.status(500).json({ error: 'Internal server error during conversation search' });
  }
};

// Global search
exports.globalSearch = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const limitNum = parseInt(limit);

    // Call the functions normally (not as Express routes)
    const [messages, users, conversations] = await Promise.all([
      (async () => {
        const fakeRes = { status: () => fakeRes, json: data => data };
        return await exports.searchMessages({ ...req, query: { ...req.query, limit: limitNum } }, fakeRes);
      })(),
      (async () => {
        const fakeRes = { status: () => fakeRes, json: data => data };
        return await exports.searchUsers({ ...req, query: { ...req.query, limit: limitNum } }, fakeRes);
      })(),
      (async () => {
        const fakeRes = { status: () => fakeRes, json: data => data };
        return await exports.searchConversations({ ...req, query: { ...req.query, limit: limitNum } }, fakeRes);
      })()
    ]);

    res.json({
      query,
      results: {
        messages: messages?.results || [],
        users: users?.users || [],
        conversations: conversations?.conversations || []
      }
    });

  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Internal server error during global search' });
  }
};

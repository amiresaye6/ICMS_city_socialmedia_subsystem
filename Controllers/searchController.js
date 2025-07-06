const User = require("../Models/users.model");
const Message = require('../Models/message.model');
const Conversation = require('../Models/conversation.model');


/*
  Message Search (for API usage)

  Used when the user performs a dedicated message search request.
  This function handles req/res and returns paginated response.
 */
module.exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query, conversationId, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search criteria
    let searchCriteria = {
      content: { $regex: query, $options: 'i' },
      deleted: false
    };

    // First, find the user document to get the MongoDB _id
    const currentUser = await User.findOne({ centralUsrId: userId });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userObjectId = currentUser._id;

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(userObjectId)) {
        return res.status(403).json({ error: 'Access denied to this conversation' });
      }
      searchCriteria.conversation = conversationId;
    } else {
      const userConversations = await Conversation.find({ participants: userObjectId }).select('_id');
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

/**
 * Message Search (RAW) - Logic-only version
 
 * Used only inside globalSearch to return search data.
 */
const searchMessagesRaw = async (userId, query, limitNum) => {
  if (!query || query.trim().length < 1) return [];

  // Find the user document to get the MongoDB _id
  const currentUser = await User.findOne({ centralUsrId: userId });
  if (!currentUser) return [];
  const userObjectId = currentUser._id;

  const userConversations = await Conversation.find({ participants: userObjectId }).select('_id');
  const conversationIds = userConversations.map(conv => conv._id);

  const messages = await Message.find({
    content: { $regex: query, $options: 'i' },
    deleted: false,
    conversation: { $in: conversationIds }
  })
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .populate('sender', 'username firstName lastName avatar')
    .populate('conversation', 'name isGroup participants')
    .populate('replyTo', 'content sender');

  return messages;
};

/**
  User Search (for API usage)

 */
module.exports.searchUsers = async (req, res) => {
  try {
    const centralUsrIdFromToken = req.user.userId;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Find current user by centralUsrId to get the MongoDB _id
    const currentUser = await User.findOne({ centralUsrId: centralUsrIdFromToken });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Use _id for excluding self
    const searchCriteria = {
      _id: { $ne: currentUser._id },
      $or: [
        { userName: { $regex: query, $options: 'i' } },
        { localUserName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    const totalUsers = await User.countDocuments(searchCriteria);

    const users = await User.find(searchCriteria)
      .select('centralUsrId userName localUserName avatarUrl bio email')
      .sort({ userName: 1 })
      .skip(skip)
      .limit(limitNum);

    const usersWithConversationStatus = await Promise.all(
      users.map(async (user) => {
        const existingConversation = await Conversation.findOne({
          participants: { $all: [currentUser._id, user._id] },
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

/**
 * User Search (RAW) - Logic-only version

 * Used only inside globalSearch to return search data.
 */
const searchUsersRaw = async (currentUserId, query, limitNum) => {
  if (!query || query.trim().length < 1) return [];

  const searchCriteria = {
    $and: [
      { centralUsrId: { $ne: currentUserId } },
      {
        $or: [
          { userName: { $regex: query, $options: 'i' } },
          { localUserName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  const users = await User.find(searchCriteria)
    .select('centralUsrId userName localUserName avatarUrl bio email')
    .sort({ userName: 1 })
    .limit(limitNum);

  return users;
};

/**
  Conversation Search (for API usage)
 */
module.exports.searchConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Find the user document to get the MongoDB _id
    const currentUser = await User.findOne({ centralUsrId: userId });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userObjectId = currentUser._id;

    const searchCriteria = {
      participants: userObjectId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'groupSettings.description': { $regex: query, $options: 'i' } }
      ]
    };

    const totalConversations = await Conversation.countDocuments(searchCriteria);

    const conversations = await Conversation.find(searchCriteria)
      .populate('participants', 'centralUsrId userName localUserName avatarUrl')
      .populate('lastMessage', 'content createdAt sender')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedConversations = conversations.map(conv => {
      let displayName = conv.name;

      if (!conv.isGroup && conv.participants.length === 2) {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== userObjectId.toString());
        displayName = otherParticipant ?
          (otherParticipant.localUserName && otherParticipant.localUserName !== 'user name' ?
            otherParticipant.localUserName :
            otherParticipant.userName) : 'Unknown User';
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

/**

  Conversation Search (RAW) - Logic-only version

 */
const searchConversationsRaw = async (userId, query, limitNum) => {
  if (!query || query.trim().length < 1) return [];

  // Find the user document to get the MongoDB _id
  const currentUser = await User.findOne({ centralUsrId: userId });
  if (!currentUser) return [];
  const userObjectId = currentUser._id;

  const searchCriteria = {
    participants: userObjectId,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { 'groupSettings.description': { $regex: query, $options: 'i' } }
    ]
  };

  const conversations = await Conversation.find(searchCriteria)
    .populate('participants', 'centralUsrId userName localUserName avatarUrl')
    .populate('lastMessage', 'content createdAt sender')
    .sort({ updatedAt: -1 })
    .limit(limitNum);

  return conversations;
};

/**
 * Global Search (Messages + Users + Conversations)
 
 * Uses the RAW versions of the search functions to aggregate all data.
 */
module.exports.globalSearch = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    const limitNum = parseInt(limit);
    const userId = req.user.userId;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [messages, users, conversations] = await Promise.all([
      searchMessagesRaw(userId, query, limitNum),
      searchUsersRaw(userId, query, limitNum),
      searchConversationsRaw(userId, query, limitNum)
    ]);

    res.json({
      query,
      results: {
        messages,
        users,
        conversations
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Internal server error during global search' });
  }
};

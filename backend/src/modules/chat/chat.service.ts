import prisma from '../../config/prisma';

export class ChatService {
  async getOrCreateConversation(matchId: string) {
    return prisma.conversation.upsert({
      where: { matchId },
      update: {},
      create: { matchId },
    });
  }

  async getMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    return prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });
  }

  async validateUserInMatch(matchId: string, userId: string): Promise<boolean> {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return false;
    }

    return match.userAId === userId || match.userBId === userId;
  }
}

const chatService = new ChatService();

export async function getOrCreateConversation(matchId: string) {
  return chatService.getOrCreateConversation(matchId);
}

export async function getMessages(conversationId: string) {
  return chatService.getMessages(conversationId);
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  return chatService.sendMessage(conversationId, senderId, content);
}

export async function validateUserInMatch(matchId: string, userId: string): Promise<boolean> {
  return chatService.validateUserInMatch(matchId, userId);
}

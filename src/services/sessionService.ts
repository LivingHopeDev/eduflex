import { prismaClient } from "..";

export class SessionService {
  async getSessionState(userId: string, sessionId: string) {
    const session = await prismaClient.session.findUnique({
      where: { userId },
    });

    if (!session) {
      return await prismaClient.session.create({
        data: {
          userId,
          state: "NEW",
          data: "{}",
        },
      });
    }

    return session;
  }

  async updateSessionState(
    userId: string,
    sessionId: string,
    state: string,
    data = {}
  ) {
    return await prismaClient.session.update({
      where: { userId },
      data: {
        state,
        data: typeof data === "string" ? data : JSON.stringify(data),
      },
    });
  }
}

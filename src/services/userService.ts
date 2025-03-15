import { prismaClient } from "..";

export class UserService {
  async findUser(phoneNumber: string) {
    return await prismaClient.user.findUnique({
      where: { phone: phoneNumber },
    });
  }

  async createUser(phoneNumber: string) {
    return await prismaClient.user.create({
      data: {
        phone: phoneNumber,
      },
    });
  }
}

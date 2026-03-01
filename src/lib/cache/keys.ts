export const cacheKeys = {
  testRedis: "accelixy:test",
  adminUsersList: "admin:users:list",
  adminWithdrawalsList: "admin:withdrawals:list",
  adminInvestmentsList: "admin:investments:list",
  userSummary: (userId: string) => `user:${userId}:summary`,
};

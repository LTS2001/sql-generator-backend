interface UserService {
  /**
   * 用户注册
   * @param userName 用户名
   * @param userAccount 用户账号
   * @param userPassword 用户密码
   * @param checkPassword 校验密码
   * @param userRole 用户角色
   * @return 新用户 id
   */
  userRegister(
    userName: string,
    userAccount: string,
    userPassword: string,
    checkPassword: string,
    userRole: string
  ): number;

  UserLogin(userAccount: string, userPassword: string);
}

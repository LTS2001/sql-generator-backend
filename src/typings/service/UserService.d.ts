import { User } from '@/model/entitys/user';

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
  ): Promise<{ id: string }>;

  /**
   * 用户登录
   * @param userAccount 用户账号
   * @param userPassword 用户密码
   * @return 脱敏后的用户信息
   */
  userLogin(userAccount: string, userPassword: string): Promise<User>;

  /**
   * 获取当前登录用户
   */
  getLoginUser(): User;

  /**
   * 是否为管理员
   */
  isAdmin(): boolean;

  /**
   * 用户注销
   */
  userLogout(): boolean;
}

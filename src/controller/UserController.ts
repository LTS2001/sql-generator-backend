import { UserRegisterRequest } from '@/model/dto/UserRegisterRequest';
import { Body, Controller, Post } from '@midwayjs/core';

@Controller('/user')
export class UserController {
  /**
   * 用户注册
   * @param userRegisterRequest 用户提交请求的 body
   */
  @Post('/register')
  async userRegister(@Body() userRegisterRequest: UserRegisterRequest) {
    if (userRegisterRequest == null) {
      throw new Error('请求参数错误！');
    }
    const { userAccount, userName, userPassword, checkPassword } =
      userRegisterRequest;
    if (userAccount == null || userPassword == null || checkPassword) {
      return null;
    }
  }
}

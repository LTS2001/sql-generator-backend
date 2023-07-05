import {
  Body,
  Controller,
  Post,
  Inject,
  Get,
  UseGuard,
  Query,
} from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { Context } from '@midwayjs/koa';
import { UserRegisterRequest } from '@/model/dto/UserRegisterRequest';
import { UserServiceImpl } from '@/service/impl/UserServiceImpl';
import { UserConstant } from '@/constant/UserConstant';
import { ResultUtils } from '@/common/ResultUtils';
import { userLoginRequest } from '@/model/dto/UserLoginRequest';
import { UserAddRequest } from '@/model/dto/UserAddRequest';
import { RequestById } from '@/common/RequestById';
import { AuthGuard } from '@/guard/auth.guard';
import { Role } from '@/decorator/role.decorator';
import { UserUpdateRequest } from '@/model/dto/UserUpdateRequest';
import { JwtMiddleware } from '@/middleware/jwt.middleware';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';

@Controller('/user')
export class UserController {
  @Inject()
  private userServiceImpl: UserServiceImpl;
  @Inject()
  private resultUtil: ResultUtils;
  @Inject()
  private jwtService: JwtService;
  @Inject()
  private ctx: Context;

  /**
   * 用户注册
   * @param userRegisterRequest 用户提交请求的 body
   */
  @Post('/register')
  async userRegister(@Body() userRegisterRequest: UserRegisterRequest) {
    const { userName, userAccount, userPassword, checkPassword } =
      userRegisterRequest;
    const resultData = await this.userServiceImpl.userRegister(
      userName,
      userAccount,
      userPassword,
      checkPassword,
      UserConstant.DEFAULT_ROLE
    );
    return this.resultUtil.success(resultData);
  }

  /**
   * 用户登录
   */
  @Post('/login')
  async userLogin(@Body() userLoginRequest: userLoginRequest) {
    const userInfo = await this.userServiceImpl.userLogin(
      userLoginRequest.userAccount,
      userLoginRequest.userPassword
    );
    // 设置响应头
    this.ctx.set('token', `Bearer ${this.jwtService.signSync(userInfo)}`);
    this.ctx.set('Access-Control-Expose-Headers', 'token');
    return this.resultUtil.success(userInfo);
  }

  /**
   * 获取当前用户信息
   */
  @Get('/get/login', { middleware: [JwtMiddleware] })
  async getLoginUser() {
    const resultData = await this.userServiceImpl.getLoginUser();
    return this.resultUtil.success(resultData);
  }

  /**
   * 用户注销
   */
  @Post('/logout')
  async userLogout() {
    const resultData = await this.userServiceImpl.userLogout();
    return this.resultUtil.success(resultData);
  }

  //#region CRUD
  /**
   * 创建用户
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/add', { middleware: [JwtMiddleware] })
  async addUser(@Body() userAddRequest: UserAddRequest) {
    const { userName, userAccount, userPassword, userRole } = userAddRequest;
    const resultData = await this.userServiceImpl.userRegister(
      userName,
      userAccount,
      userPassword,
      userPassword,
      userRole
    );
    return this.resultUtil.success(resultData);
  }

  /**
   * 删除用户
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/delete', { middleware: [JwtMiddleware] })
  async deleteUser(@Body() deleteRequest: RequestById) {
    const resultData = await this.userServiceImpl.deleteUser(deleteRequest.id);
    return this.resultUtil.success({
      status: resultData,
      msg: '删除成功',
    });
  }

  /**
   * 更新用户
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/update', { middleware: [JwtMiddleware] })
  async updateUser(@Body() userUpdateRequest: UserUpdateRequest) {
    const resultData = await this.userServiceImpl.updateUser(userUpdateRequest);
    return this.resultUtil.success({
      status: resultData,
      msg: '更新成功',
    });
  }

  /**
   * 根据 id 获取用户
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Get('/get', { middleware: [JwtMiddleware] })
  async getUserById(@Query() getRequest: RequestById) {
    const resultData = await this.userServiceImpl.getUser(getRequest.id);
    return this.resultUtil.success(resultData);
  }

  /**
   * 分页获取
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/list/page', { middleware: [JwtMiddleware] })
  async listUserByPage(@Body() userQueryRequest) {
    const { current, pageSize } = userQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    const resultData = await this.userServiceImpl.getQueryWrapper(
      userQueryRequest
    );
    return this.resultUtil.success(resultData);
  }
  //#endregion
}

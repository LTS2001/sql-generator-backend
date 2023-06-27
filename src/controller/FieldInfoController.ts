import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Query,
  UseGuard,
} from '@midwayjs/core';
import { FieldInfoAddRequest } from '@/model/dto/FieldInfoAddRequest';
import { FieldInfoServiceImpl } from '@/service/impl/FieldInfoServiceImpl';
import { ResultUtils } from '@/common/ResultUtils';
import { ValidLogin } from '@/middleware/validLogin.middleware';
import { RequestById } from '@/common/RequestById';
import { AuthGuard } from '@/guard/auth.guard';
import { Role } from '@/decorator/role.decorator';
import { UserConstant } from '@/constant/UserConstant';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { FieldInfoUpdateRequest } from '@/model/dto/FieldInfoUpdateRequest';
import { FieldInfoQueryRequest } from '@/model/dto/FieldInfoQueryRequest';
import { ErrorCode } from '@/common/ErrorCode';
import { BusinessException } from '@/exception/BusinessException';
import { Context } from '@midwayjs/koa';

/**
 * 字段信息接口，需要先登录
 */
@Controller('/field_info', { middleware: [ValidLogin] })
export class FieldInfoController {
  @Inject()
  fieldInfoServiceImpl: FieldInfoServiceImpl;
  @Inject()
  resultUtils: ResultUtils;
  @Inject()
  ctx: Context;

  //#region CRUD
  /**
   * 创建
   */
  @Post('/add')
  async addFieldInfo(@Body() fieldInfoAddRequest: FieldInfoAddRequest) {
    const { name, content } = fieldInfoAddRequest;
    const resultData = await this.fieldInfoServiceImpl.addFieldInfo(
      name,
      content
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 删除
   */
  @Get('/delete')
  async deleteFieldInfo(@Query() deleteRequest: RequestById) {
    const resultData = await this.fieldInfoServiceImpl.deleteFieldInfo(
      deleteRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role(UserConstant.ADMIN_ROLE)
  @Post('/update', { middleware: [AuthMiddleware] })
  async updateFieldInfo(
    @Body() fieldInfoUpdateRequest: FieldInfoUpdateRequest
  ) {
    const { id, name, fieldName, content, reviewStatus, reviewMessage } =
      fieldInfoUpdateRequest;
    const resultData = await this.fieldInfoServiceImpl.updateFieldInfo(
      id,
      name,
      fieldName,
      content,
      reviewStatus,
      reviewMessage
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 根据 id 获取
   */
  @Get('/get')
  async getFieldInfoById(@Query() getFieldInfoRequest: RequestById) {
    const resultData = await this.fieldInfoServiceImpl.getFieldInfoById(
      getFieldInfoRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取 fieldInfo 全部列表（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Get('/list', { middleware: [AuthMiddleware] })
  async listDict() {
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      new FieldInfoQueryRequest()
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取列表
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/list/page', { middleware: [AuthMiddleware] })
  async listDictByPage(@Body() fieldInfoQueryRequest: FieldInfoQueryRequest) {
    const { current, pageSize } = fieldInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取当前用户可选的全部资源列表
   */
  @Get('/my/list')
  async listMyDict() {
    const fieldInfoQueryRequest = new FieldInfoQueryRequest();
    // 需要审核通过的，且是本人的
    fieldInfoQueryRequest.reviewStatus = 1;
    fieldInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户可选的资源列表
   */
  @Get('/my/list/page')
  async listMyDictByPage(
    @Query() fieldInfoQueryRequest: FieldInfoQueryRequest
  ) {
    const { current, pageSize } = fieldInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要审核通过的，且是本人的
    fieldInfoQueryRequest.reviewStatus = 1;
    fieldInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户创建的资源
   */
  @Get('/my/add/list/page')
  async listMyAddDictByPage(
    @Query() fieldInfoQueryRequest: FieldInfoQueryRequest
  ) {
    const { current, pageSize } = fieldInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要是本人的
    fieldInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }
  //#endregion
}

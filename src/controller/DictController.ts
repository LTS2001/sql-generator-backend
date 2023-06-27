import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuard,
  Get,
  Query,
} from '@midwayjs/core';
import { DictAddRequest } from '@/model/dto/DictAddRequest';
import { DictServiceImpl } from '@/service/impl/DictServiceImpl';
import { ResultUtils } from '@/common/ResultUtils';
import { RequestById } from '@/common/RequestById';
import { AuthGuard } from '@/guard/auth.guard';
import { DictUpdateRequest } from '@/model/dto/DictUpdateRequest';
import { Role } from '@/decorator/role.decorator';
import { UserConstant } from '@/constant/UserConstant';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { DictQueryRequest } from '@/model/dto/DictQueryRequest';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { Context } from '@midwayjs/koa';
import { ValidLogin } from '@/middleware/validLogin.middleware';

/**
 * 词条接口，前提需要先登录
 */
@Controller('/dict', { middleware: [ValidLogin] })
export class DictController {
  @Inject()
  dictServiceImpl: DictServiceImpl;

  @Inject()
  resultUtils: ResultUtils;

  @Inject()
  ctx: Context;

  //#region CRUD
  /**
   * 创建
   */
  @Post('/add')
  async addDict(@Body() dictAddRequest: DictAddRequest) {
    const dictContent = this.dictServiceImpl.handleDictContent(
      dictAddRequest.content
    );
    const resultData = await this.dictServiceImpl.addDict(
      dictAddRequest.name,
      dictContent
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 删除
   */
  @Post('/delete')
  async deleteDict(@Body() deleteRequest: RequestById) {
    const resultData = await this.dictServiceImpl.deleteDict(deleteRequest.id);
    return this.resultUtils.success(resultData);
  }

  /**
   * 更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/update', { middleware: [AuthMiddleware] })
  async updateDict(@Body() dictUpdateRequest: DictUpdateRequest) {
    const { id, name, content, reviewStatus, reviewMessage } =
      dictUpdateRequest;
    // 处理 content 内容
    const handleContent = this.dictServiceImpl.handleDictContent(content);
    const resultData = await this.dictServiceImpl.updateDict(
      id,
      name,
      handleContent,
      reviewStatus,
      reviewMessage
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 根据 id 获取
   */
  @Get('/get')
  async getDictById(@Query() getDictRequest: RequestById) {
    const resultData = await this.dictServiceImpl.getDictById(
      getDictRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取 dict 全部列表（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Get('/list', { middleware: [AuthMiddleware] })
  async listDict() {
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      new DictQueryRequest()
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取列表
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/list/page', { middleware: [AuthMiddleware] })
  async listDictByPage(@Body() dictQueryRequest: DictQueryRequest) {
    const { current, pageSize } = dictQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取当前用户可选的全部资源列表
   */
  @Get('/my/list')
  async listMyDict() {
    const dictQueryRequest = new DictQueryRequest();
    // 需要审核通过的，且是本人的
    dictQueryRequest.reviewStatus = 1;
    dictQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户可选的资源列表
   */
  @Get('/my/list/page')
  async listMyDictByPage(@Query() dictQueryRequest: DictQueryRequest) {
    const { current, pageSize } = dictQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要审核通过的，且是本人的
    dictQueryRequest.reviewStatus = 1;
    dictQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户创建的资源
   */
  @Get('/my/add/list/page')
  async listMyAddDictByPage(@Query() dictQueryRequest: DictQueryRequest) {
    const { current, pageSize } = dictQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要是本人的
    dictQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(resultData);
  }
  //#endregion

  /**
   * 生成创建表的 SQL
   */
  // @Get('/generator/sql')
  // async generateCreateSql(@Query() dictIdRequest: RequestById) {}
}

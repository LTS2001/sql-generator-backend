import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuard,
  Get,
  Query,
} from '@midwayjs/core';
import { TableInfoAddRequest } from '@/model/dto/TableInfoAddRequest';
import { TableInfoServiceImpl } from '@/service/impl/TableInfoServiceImpl';
import { ResultUtils } from '@/common/ResultUtils';
import { RequestById } from '@/common/RequestById';
import { AuthGuard } from '@/guard/auth.guard';
import { TableInfoUpdateRequest } from '@/model/dto/TableInfoUpdateRequest';
import { Role } from '@/decorator/role.decorator';
import { UserConstant } from '@/constant/UserConstant';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { TableInfoQueryRequest } from '@/model/dto/TableInfoQueryRequest';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { Context } from '@midwayjs/koa';
import { ValidLogin } from '@/middleware/validLogin.middleware';

/**
 * 表信息接口，前提需要先登录
 */
@Controller('/table_info', { middleware: [ValidLogin] })
export class TableInfoController {
  @Inject()
  tableInfoServiceImpl: TableInfoServiceImpl;

  @Inject()
  resultUtils: ResultUtils;

  @Inject()
  ctx: Context;

  //#region CRUD
  /**
   * 创建
   */
  @Post('/add')
  async addTableInfo(@Body() tableInfoAddRequest: TableInfoAddRequest) {
    // 后续再验证处理content。。。。。。。。。。。。。。。
    const resultData = await this.tableInfoServiceImpl.addTableInfo(
      tableInfoAddRequest.name,
      tableInfoAddRequest.content
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 删除
   */
  @Post('/delete')
  async deleteDict(@Body() deleteRequest: RequestById) {
    const resultData = await this.tableInfoServiceImpl.deleteTableInfo(
      deleteRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/update', { middleware: [AuthMiddleware] })
  async updateDict(@Body() tableInfoUpdateRequest: TableInfoUpdateRequest) {
    const { id, name, content, reviewStatus, reviewMessage } =
      tableInfoUpdateRequest;
    // 后续再验证处理content。。。。。。。。。。。。
    // // 处理 content 内容
    // const handleContent = this.tableInfoServiceImpl.handleDictContent(content);
    const resultData = await this.tableInfoServiceImpl.updateTableInfo(
      id,
      name,
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
  async getDictById(@Query() getTableInfoRequest: RequestById) {
    const resultData = await this.tableInfoServiceImpl.getTableInfoById(
      getTableInfoRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取 tableInfo 全部列表（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Get('/list', { middleware: [AuthMiddleware] })
  async listTableInfo() {
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      new TableInfoQueryRequest()
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取列表
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/list/page', { middleware: [AuthMiddleware] })
  async listTableInfoByPage(
    @Body() tableInfoQueryRequest: TableInfoQueryRequest
  ) {
    const { current, pageSize } = tableInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 获取当前用户可选的全部资源列表
   */
  @Get('/my/list')
  async listMyTableInfo() {
    const tableInfoQueryRequest = new TableInfoQueryRequest();
    // 需要审核通过的，且是本人的
    tableInfoQueryRequest.reviewStatus = 1;
    tableInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户可选的资源列表
   */
  @Get('/my/list/page')
  async listMyTableInfoByPage(
    @Query() tableInfoQueryRequest: TableInfoQueryRequest
  ) {
    const { current, pageSize } = tableInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要审核通过的，且是本人的
    tableInfoQueryRequest.reviewStatus = 1;
    tableInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户创建的资源
   */
  @Get('/my/add/list/page')
  async listMyAddTableInfoByPage(
    @Query() tableInfoQueryRequest: TableInfoQueryRequest
  ) {
    const { current, pageSize } = tableInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要是本人的
    tableInfoQueryRequest.userId =
      this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
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

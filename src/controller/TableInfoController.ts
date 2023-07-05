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
import { TableInfoQueryRequest } from '@/model/dto/TableInfoQueryRequest';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { Context } from '@midwayjs/koa';
import { JwtMiddleware } from '@/middleware/jwt.middleware';
import { TableInfo } from '@/model/entitys/tableInfo';
import { SqlBuilder } from '@/core/builder/SqlBuilder';

/**
 * 表信息接口，前提需要先登录
 */
@Controller('/table_info')
export class TableInfoController {
  @Inject()
  ctx: Context;
  @Inject()
  tableInfoServiceImpl: TableInfoServiceImpl;
  @Inject()
  sqlBuilder: SqlBuilder;
  @Inject()
  resultUtils: ResultUtils;

  //#region CRUD
  /**
   * （通过）创建
   */
  @Post('/add', { middleware: [JwtMiddleware] })
  async addTableInfo(@Body() tableInfoAddRequest: TableInfoAddRequest) {
    const { name, content, reviewStatus, reviewMessage } = tableInfoAddRequest;
    const resultData = await this.tableInfoServiceImpl.addTableInfo(
      name,
      content,
      reviewStatus,
      reviewMessage
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）删除
   */
  @Post('/delete', { middleware: [JwtMiddleware] })
  async deleteDict(@Body() deleteRequest: RequestById) {
    const resultData = await this.tableInfoServiceImpl.deleteTableInfo(
      deleteRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/update', { middleware: [JwtMiddleware] })
  async updateDict(@Body() tableInfoUpdateRequest: TableInfoUpdateRequest) {
    const { id, name, content, reviewStatus, reviewMessage } =
      tableInfoUpdateRequest;
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
  @Get('/list', { middleware: [JwtMiddleware] })
  async listTableInfo() {
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      new TableInfoQueryRequest()
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取列表
   */
  @Post('/list/page')
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
  @Get('/my/list', { middleware: [JwtMiddleware] })
  async listMyTableInfo() {
    const tableInfoQueryRequest = new TableInfoQueryRequest();
    // 需要审核通过的，且是本人的
    tableInfoQueryRequest.reviewStatus = 1;
    tableInfoQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户可选的资源列表
   */
  @Get('/my/list/page', { middleware: [JwtMiddleware] })
  async listMyTableInfoByPage(
    @Query() tableInfoQueryRequest: TableInfoQueryRequest
  ) {
    const { current, pageSize } = tableInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要审核通过的，且是本人的
    tableInfoQueryRequest.reviewStatus = 1;
    tableInfoQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * 分页获取当前用户创建的资源
   */
  @Post('/my/add/list/page', { middleware: [JwtMiddleware] })
  async listMyAddTableInfoByPage(
    @Body() tableInfoQueryRequest: TableInfoQueryRequest
  ) {
    const { current, pageSize } = tableInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    // 需要是本人的
    tableInfoQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.tableInfoServiceImpl.getQueryWrapper(
      tableInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }
  //#endregion

  /**
   * 生成创建表的 SQL
   */
  @Get('/generate/sql')
  async generateCreateSql(@Query() tableInfoIdRequest: RequestById) {
    const {
      dataValues: { content },
    } = await TableInfo.findOne({
      where: {
        id: tableInfoIdRequest.id,
      },
    });
    try {
      JSON.parse(content);
    } catch (error) {
      throw new BusinessException(ErrorCode.SYSTEM_ERROR);
    }
    const resultData = await this.sqlBuilder.buildCreateTableSql(
      JSON.parse(content)
    );
    return this.resultUtils.success(resultData);
  }
}

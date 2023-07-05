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
import { DictQueryRequest } from '@/model/dto/DictQueryRequest';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { Context } from '@midwayjs/koa';
import { JwtMiddleware } from '@/middleware/jwt.middleware';
import { Field, TableSchema } from '@/core/schema/TableSchema';
import { Dict } from '@/model/entitys/dict';
import { GenerateFacade } from '@/core/GeneratorFacade';

/**
 * 词条接口，前提需要先登录
 */
@Controller('/dict')
export class DictController {
  @Inject()
  private generatorFacade: GenerateFacade;
  @Inject()
  private dictServiceImpl: DictServiceImpl;
  @Inject()
  private resultUtils: ResultUtils;
  @Inject()
  private ctx: Context;

  //#region CRUD
  /**
   * （通过）创建
   */
  @Post('/add', { middleware: [JwtMiddleware] })
  async addDict(@Body() dictAddRequest: DictAddRequest) {
    const dictContent = this.dictServiceImpl.handleDictContent(
      dictAddRequest.content
    );
    const resultData = await this.dictServiceImpl.addDict(
      dictAddRequest.name,
      dictContent,
      dictAddRequest.reviewStatus,
      dictAddRequest.reviewMessage
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）删除
   */
  @Post('/delete', { middleware: [JwtMiddleware] })
  async deleteDict(@Body() deleteRequest: RequestById) {
    const resultData = await this.dictServiceImpl.deleteDict(deleteRequest.id);
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role([UserConstant.ADMIN_ROLE])
  @Post('/update', { middleware: [JwtMiddleware] })
  async updateDict(@Body() dictUpdateRequest: DictUpdateRequest) {
    const { id, name, content, reviewStatus, reviewMessage } =
      dictUpdateRequest;
    let handleContent: string;
    // 处理 content 内容
    if (content) {
      handleContent = this.dictServiceImpl.handleDictContent(content);
    }
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
   * （通过）分页获取列表
   */
  @Post('/list/page')
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
   * （通过）获取当前用户可选的全部资源列表
   */
  @Get('/my/list', { middleware: [JwtMiddleware] })
  async listMyDict() {
    const dictQueryRequest = new DictQueryRequest();
    // 需要审核通过的，且是本人的，或者公开的（状态为 1）
    dictQueryRequest.reviewStatus !== 2;
    dictQueryRequest.userId = this.ctx.userInfo.id;
    const { records } = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(records);
  }

  /**
   * （通过）分页获取当前用户可选的资源列表（可选资源为 0-待审核的 1-已审核的(即为公开词库)）
   */
  @Post('/my/list/page', { middleware: [JwtMiddleware] })
  async listMyDictByPage(@Body() dictQueryRequest: DictQueryRequest) {
    const { current, pageSize } = dictQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    dictQueryRequest.reviewStatus !== 2;
    dictQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.dictServiceImpl.getQueryWrapper(
      dictQueryRequest
    );
    return this.resultUtils.success(resultData);
  }
  //#endregion

  /**
   * （通过）生成创建表的 SQL
   */
  @Post('/generate/sql')
  async generateCreateSql(@Body() dictIdRequest: RequestById) {
    const tableSchema = new TableSchema();
    const { dataValues } = await Dict.findOne({
      where: {
        id: dictIdRequest.id,
      },
    });
    tableSchema.tableName = 'dict';
    tableSchema.tableComment = dataValues.name;
    tableSchema.mockNum = 20;
    const idField = new Field();
    idField.fieldName = 'id';
    idField.fieldType = 'bigint';
    idField.notNull = true;
    idField.comment = 'id';
    idField.mockType = '不模拟';
    idField.primaryKey = true;
    idField.autoIncrement = true;
    tableSchema.fieldList.push(idField);
    const dataField = new Field();
    dataField.fieldName = 'data';
    dataField.fieldType = 'text';
    dataField.comment = '数据';
    dataField.mockType = '词库';
    dataField.mockParams = dataValues.content;
    tableSchema.fieldList.push(dataField);
    const resultData = await this.generatorFacade.generateAll(tableSchema);
    return this.resultUtils.success(resultData);
  }
}

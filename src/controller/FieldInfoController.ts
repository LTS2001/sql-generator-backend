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
import { RequestById } from '@/common/RequestById';
import { AuthGuard } from '@/guard/auth.guard';
import { Role } from '@/decorator/role.decorator';
import { UserConstant } from '@/constant/UserConstant';
import { FieldInfoUpdateRequest } from '@/model/dto/FieldInfoUpdateRequest';
import { FieldInfoQueryRequest } from '@/model/dto/FieldInfoQueryRequest';
import { ErrorCode } from '@/common/ErrorCode';
import { BusinessException } from '@/exception/BusinessException';
import { Context } from '@midwayjs/koa';
import { JwtMiddleware } from '@/middleware/jwt.middleware';
import { FieldInfo } from '@/model/entitys/fieldInfo';
import { SqlBuilder } from '@/core/builder/SqlBuilder';

/**
 * 字段信息接口，需要先登录
 */
@Controller('/field_info')
export class FieldInfoController {
  @Inject()
  ctx: Context;
  @Inject()
  fieldInfoServiceImpl: FieldInfoServiceImpl;
  @Inject()
  sqlBuilder: SqlBuilder;
  @Inject()
  resultUtils: ResultUtils;

  //#region CRUD
  /**
   * （通过）创建
   */
  @Post('/add', { middleware: [JwtMiddleware] })
  async addFieldInfo(@Body() fieldInfoAddRequest: FieldInfoAddRequest) {
    const { name, content, reviewStatus, reviewMessage } = fieldInfoAddRequest;
    const resultData = await this.fieldInfoServiceImpl.addFieldInfo(
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
  async deleteFieldInfo(@Body() deleteRequest: RequestById) {
    const resultData = await this.fieldInfoServiceImpl.deleteFieldInfo(
      deleteRequest.id
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）更新（仅管理员）
   */
  @UseGuard(AuthGuard)
  @Role(UserConstant.ADMIN_ROLE)
  @Post('/update', { middleware: [JwtMiddleware] })
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

  // /**
  //  * 获取 fieldInfo 全部列表（仅管理员）
  //  */
  // @UseGuard(AuthGuard)
  // @Role([UserConstant.ADMIN_ROLE])
  // @Get('/list')
  // async listDict() {
  //   const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
  //     new FieldInfoQueryRequest()
  //   );
  //   return this.resultUtils.success(resultData);
  // }

  /**
   * （通过）分页获取列表
   */
  @Post('/list/page')
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

  // /**
  //  * 获取当前用户可选的全部资源列表
  //  */
  // @Get('/my/list')
  // async listMyDict() {
  //   const fieldInfoQueryRequest = new FieldInfoQueryRequest();
  //   // 需要审核通过的，且是本人的
  //   fieldInfoQueryRequest.reviewStatus = 1;
  //   fieldInfoQueryRequest.userId =
  //     this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
  //   const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
  //     fieldInfoQueryRequest
  //   );
  //   return this.resultUtils.success(resultData);
  // }

  /**
   * （通过）分页获取当前用户可选的资源列表（不包括拒绝）
   */
  @Get('/my/list/page', { middleware: [JwtMiddleware] })
  async listMyDictByPage(
    @Query() fieldInfoQueryRequest: FieldInfoQueryRequest
  ) {
    const { current, pageSize } = fieldInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    fieldInfoQueryRequest.reviewStatus !== 2;
    fieldInfoQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }

  /**
   * （通过）分页获取当前用户创建的资源（包括拒绝的）
   */
  @Post('/my/add/list/page', { middleware: [JwtMiddleware] })
  async listMyAddDictByPage(
    @Body() fieldInfoQueryRequest: FieldInfoQueryRequest
  ) {
    const { current, pageSize } = fieldInfoQueryRequest;
    // current 和 pageSize 必须不能为空
    if (current == null || pageSize == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    fieldInfoQueryRequest.userId = this.ctx.userInfo.id;
    const resultData = await this.fieldInfoServiceImpl.getQueryWrapper(
      fieldInfoQueryRequest
    );
    return this.resultUtils.success(resultData);
  }
  //#endregion

  /**
   * （通过）生成创建表的 SQL
   */
  @Get('/generate/sql')
  async generateCreateSql(@Query() fieldInfoIdRequest: RequestById) {
    const {
      dataValues: { content },
    } = await FieldInfo.findOne({
      where: {
        id: fieldInfoIdRequest.id,
      },
    });
    try {
      JSON.parse(content);
    } catch (error) {
      throw new BusinessException(ErrorCode.SYSTEM_ERROR);
    }
    const resultData = this.sqlBuilder.buildCreateFieldSql(JSON.parse(content));
    return this.resultUtils.success(resultData);
  }
}

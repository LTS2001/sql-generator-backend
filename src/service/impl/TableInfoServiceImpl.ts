import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { UserServiceImpl } from './UserServiceImpl';
import { TableInfoQueryRequest } from '@/model/dto/TableInfoQueryRequest';
import { Op, fn, col } from 'sequelize';
import { TableInfo } from '@/model/entitys/tableInfo';
import { PageInfoVO } from '@/typings/model/vo/pageInfoVo';
import { FieldInfoServiceImpl } from './FieldInfoServiceImpl';

@Provide()
export class TableInfoServiceImpl {
  @Inject()
  ctx: Context;

  @Inject()
  userServiceImpl: UserServiceImpl;

  @Inject()
  fieldInfoServiceImpl: FieldInfoServiceImpl;

  /**
   * 校验
   * @param 需要校验的内容
   */
  validTableSchemaContent(tableSchemaContent: string): TableSchema {
    if (!tableSchemaContent)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '内容不能为空');
    try {
      JSON.parse(tableSchemaContent);
    } catch (error) {
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '内容格式错误');
    }
    const fulfillTableSchema: TableSchema = {
      dbName: null,
      tableName: null,
      tableComment: null,
      mockNum: null,
      fieldList: [],
    };
    const parseTableSchemaContent: TableSchema = JSON.parse(tableSchemaContent);
    const { dbName, tableName, tableComment, mockNum, fieldList } =
      parseTableSchemaContent;
    if (dbName) fulfillTableSchema.dbName = dbName;
    if (!tableName)
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        '表名 tableName 属性不能为空'
      );
    fulfillTableSchema.tableName = tableName;
    if (tableComment) fulfillTableSchema.tableComment = tableComment;
    if (!mockNum) fulfillTableSchema.mockNum = mockNum;
    if (!fieldList || fieldList.length === 0)
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        '字段名 fieldList 不能为空'
      );
    fieldList.forEach(field => {
      fulfillTableSchema.fieldList.push(
        this.fieldInfoServiceImpl.validFieldContent(JSON.stringify(field))
      );
    });
    return fulfillTableSchema;
  }

  /**
   * 获取查询包装类
   * @param tableInfoQueryRequest 查询请求
   */
  async getQueryWrapper(
    tableInfoQueryRequest: TableInfoQueryRequest
  ): Promise<PageInfoVO<TableInfo>> {
    // 数据的偏移量
    let offset;
    const {
      name,
      content,
      reviewStatus,
      reviewMessage,
      userId,
      pageSize,
      current,
    } = tableInfoQueryRequest;
    // 若 sortField 或者 sortOrder 为空，则让其分别为 id 和 ASC
    let { sortField, sortOrder } = tableInfoQueryRequest;
    if (sortField == null || sortOrder == null) {
      sortField = 'id';
      sortOrder = 'ASC';
    }
    // 若 pageSize 或者 current 为空，则让 offset 为空
    if (pageSize == null || current == null) {
      offset = null;
    } else {
      offset = (current - 1) * pageSize;
    }
    // name 模糊查询条件
    const nameLikeSelect = {
      name: {
        [Op.like]: '%' + tableInfoQueryRequest.name + '%',
      },
    };
    // content 模糊查询条件
    const contentLikeSelect = {
      content: {
        [Op.like]: '%' + tableInfoQueryRequest.content + '%',
      },
    };
    // reviewStatus 查询条件
    const reviewStatusSelect = {
      reviewStatus: tableInfoQueryRequest.reviewStatus,
    };
    // reviewMessage 查询条件
    const reviewMessageSelect = {
      reviewMessage: tableInfoQueryRequest.reviewMessage,
    };
    // userId 查询条件
    const userIdSelect = {
      userId: tableInfoQueryRequest.userId,
    };

    const result = await TableInfo.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          content ? contentLikeSelect : null,
          reviewStatus || reviewStatus === 0 ? reviewStatusSelect : null,
          reviewMessage ? reviewMessageSelect : null,
          userId ? userIdSelect : null,
          {
            isDelete: 0,
          },
        ],
      },
      limit: pageSize,
      offset,
    });
    const [
      {
        dataValues: { total },
      },
    ] = await TableInfo.findAll({
      attributes: [[fn('COUNT', col('id')), 'total']],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          content ? contentLikeSelect : null,
          reviewStatus || reviewStatus === 0 ? reviewStatusSelect : null,
          reviewMessage ? reviewMessageSelect : null,
          userId ? userIdSelect : null,
          {
            isDelete: 0,
          },
        ],
      },
    });
    const resultArr = [];
    result.forEach(item => {
      resultArr.push(item.dataValues);
    });
    return {
      current,
      total,
      size: pageSize,
      records: resultArr,
    };
  }

  //#region CRUD
  /**
   * 添加表信息
   * @param tableInfoName 表名
   * @param tableInfoContent 表内容
   * @return 插入的表信息的 id
   */
  async addTableInfo(
    tableInfoName: string,
    tableInfoContent: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<{ id: number }> {
    const curUserId = this.ctx.userInfo.id;
    // 验证 tableInfoContent 的规范性
    this.validTableSchemaContent(tableInfoContent);
    const tableInfoObj = {
      name: tableInfoName,
      content: tableInfoContent,
      userId: curUserId,
    };
    if (reviewStatus) tableInfoObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) tableInfoObj['reviewMessage'] = reviewMessage;
    const result = await new TableInfo(tableInfoObj).save();
    if (result == null) throw new BusinessException(ErrorCode.OPERATION_ERROR);
    return { id: result['null'] };
  }

  /**
   * 删除一个表信息
   * @param id 表信息 id
   */
  async deleteTableInfo(id: number): Promise<boolean> {
    // 仅为本人或者管理员才可以删除
    const curUserId = this.ctx.userInfo.id;
    const {
      dataValues: { userId },
    } = await TableInfo.findOne({
      attributes: ['userId'],
      where: { id },
    });
    if (curUserId !== userId && !this.userServiceImpl.isAdmin())
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    const result = await TableInfo.update(
      {
        isDelete: 1,
      },
      {
        where: { id },
      }
    );
    if (result[0] !== 1) throw new BusinessException(ErrorCode.PARAMS_ERROR);
    return true;
  }

  /**
   * 更新一个表信息
   * @param id 表信息 id
   * @param name 表信息名
   * @param content 表信息内容
   * @param reviewStatus 审核状态
   * @param reviewMessage 审核信息
   */
  async updateTableInfo(
    id: number,
    name: string,
    content: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<boolean> {
    const tableInfoObj = {};
    if (content) this.validTableSchemaContent(content);
    tableInfoObj['content'] = content;
    if (name) tableInfoObj['name'] = name;
    if (reviewStatus) tableInfoObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) tableInfoObj['reviewMessage'] = reviewMessage;
    const result = await TableInfo.update(tableInfoObj, {
      where: { id },
    });
    if (result[0] !== 1) throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    return true;
  }

  /**
   * 根据表信息 id 获取
   * @param id 表信息 id
   * @return 表信息
   */
  async getTableInfoById(id: number): Promise<TableInfo> {
    const result = await TableInfo.findOne({
      where: { id },
    });
    if (result == null) throw new BusinessException(ErrorCode.PARAMS_ERROR);
    return result.dataValues;
  }

  //#endregion
}

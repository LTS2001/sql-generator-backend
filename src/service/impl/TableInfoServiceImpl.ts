import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { Dict } from '@/model/entitys/dict';
import { UserConstant } from '@/constant/UserConstant';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { UserServiceImpl } from './UserServiceImpl';
import { TableInfoQueryRequest } from '@/model/dto/TableInfoQueryRequest';
import { Op } from 'sequelize';
import { TableInfo } from '@/model/entitys/tableInfo';

@Provide()
export class TableInfoServiceImpl {
  @Inject()
  ctx: Context;

  @Inject()
  userServiceImpl: UserServiceImpl;

  /**
   * 获取查询包装类
   * @param tableInfoQueryRequest 查询请求
   */
  async getQueryWrapper(
    tableInfoQueryRequest: TableInfoQueryRequest
  ): Promise<Array<Dict>> {
    // 数据的偏移量
    let offset;
    const { name, content, reviewStatus, userId, pageSize, current } =
      tableInfoQueryRequest;
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
    // userId 查询条件
    const userIdSelect = {
      userId: tableInfoQueryRequest.userId,
    };

    const result = await Dict.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          content ? contentLikeSelect : null,
          reviewStatus ? reviewStatusSelect : null,
          userId ? userIdSelect : null,
        ],
      },
      limit: pageSize,
      offset,
    });
    const resultArr = [];
    result.forEach(item => {
      resultArr.push(item.dataValues);
    });
    return resultArr;
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
    tableInfoContent: string
  ): Promise<{ id: number }> {
    const curUserId = this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
    const result = await new TableInfo({
      name: tableInfoName,
      content: tableInfoContent,
      userId: curUserId,
    }).save();
    if (result == null) throw new BusinessException(ErrorCode.OPERATION_ERROR);
    return { id: result['null'] };
  }

  /**
   * 删除一个表信息
   * @param id 表信息 id
   */
  async deleteTableInfo(id: number): Promise<boolean> {
    // 仅为本人或者管理员才可以删除
    const curUserId = this.ctx.session[UserConstant.USER_LOGIN_STATE].id;
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
    const result = await TableInfo.update(
      {
        name,
        content,
        reviewStatus,
        reviewMessage,
      },
      {
        where: { id },
      }
    );
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

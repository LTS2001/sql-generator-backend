import { ErrorCode } from '@/common/ErrorCode';
import { UserConstant } from '@/constant/UserConstant';
import { BusinessException } from '@/exception/BusinessException';
import { FieldInfo } from '@/model/entitys/fieldInfo';
import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserServiceImpl } from './UserServiceImpl';
import { FieldInfoQueryRequest } from '@/model/dto/FieldInfoQueryRequest';
import { Op } from 'sequelize';

@Provide()
export class FieldInfoServiceImpl {
  @Inject()
  ctx: Context;
  @Inject()
  userServiceImpl: UserServiceImpl;

  /**
   * 校验
   * @param 需要校验的内容
   */
  validContent(content: string) {
    const parseContent = JSON.parse(content);
    if (!parseContent.fieldName)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '字段名不能为空');
    return parseContent;
  }

  /**
   * 获取查询包装类
   * @param fieldInfoQueryRequest 查询请求
   */
  async getQueryWrapper(
    fieldInfoQueryRequest: FieldInfoQueryRequest
  ): Promise<Array<FieldInfo>> {
    // 数据的偏移量
    let offset;
    const { searchName, content, reviewStatus, userId, pageSize, current } =
      fieldInfoQueryRequest;
    // 若 sortField 或者 sortOrder 为空，则让其分别为 id 和 ASC
    let { sortField, sortOrder } = fieldInfoQueryRequest;
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
        [Op.like]: '%' + fieldInfoQueryRequest.searchName + '%',
      },
    };
    // fieldName 模糊查询条件
    const fieldNameSelect = {
      fieldName: {
        [Op.like]: '%' + fieldInfoQueryRequest.searchName + '%',
      },
    };
    // content 模糊查询条件
    const contentLikeSelect = {
      content: {
        [Op.like]: '%' + fieldInfoQueryRequest.content + '%',
      },
    };
    // reviewStatus 查询条件
    const reviewStatusSelect = {
      reviewStatus: fieldInfoQueryRequest.reviewStatus,
    };
    // userId 查询条件
    const userIdSelect = {
      userId: fieldInfoQueryRequest.userId,
    };

    const result = await FieldInfo.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              searchName ? nameLikeSelect : null,
              searchName ? fieldNameSelect : null,
            ],
          },
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
   * 创建
   * @param name 字段名
   * @param content 字段内容
   * @return 字段 id
   */
  async addFieldInfo(name: string, content: string): Promise<number> {
    const parseContent = this.validContent(content);
    const result = await new FieldInfo({
      name,
      fieldName: parseContent.fieldName,
      content,
      userId: this.ctx.session[UserConstant.USER_LOGIN_STATE].id,
    }).save();
    return result['null'];
  }

  /**
   * 删除
   * @param id 要删除的字段的 id
   */
  async deleteFieldInfo(id: number): Promise<boolean> {
    // 只有创建用户本人或者管理员才有权删除
    const curUserId = this.ctx.session[UserConstant.USER_LOGIN_STATE].userId;
    const {
      dataValues: { userId },
    } = await FieldInfo.findOne({
      attributes: ['userId'],
      where: { id },
    });
    if (userId !== curUserId && !this.userServiceImpl.isAdmin())
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    const result = await FieldInfo.update(
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
   * 更新一个字段
   * @param id 字段 id
   * @param name 名称
   * @param fieldName 字段名称
   * @param content 字段内容
   * @param reviewStatus 审核状态
   * @param reviewMessage 审核信息
   */
  async updateFieldInfo(
    id: number,
    name: string,
    fieldName: string,
    content: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<boolean> {
    this.validContent(content);
    const result = await FieldInfo.update(
      {
        name,
        content,
        fieldName,
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
   * 根据字段 id 获取
   * @param id 字段 id
   * @return 字段信息
   */
  async getFieldInfoById(id: number): Promise<FieldInfo> {
    const result = await FieldInfo.findOne({
      where: { id },
    });
    if (result == null) throw new BusinessException(ErrorCode.PARAMS_ERROR);
    return result.dataValues;
  }
  //#endregion
}

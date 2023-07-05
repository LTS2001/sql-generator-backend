import { ErrorCode } from '@/common/ErrorCode';
import { BusinessException } from '@/exception/BusinessException';
import { FieldInfo } from '@/model/entitys/fieldInfo';
import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserServiceImpl } from './UserServiceImpl';
import { FieldInfoQueryRequest } from '@/model/dto/FieldInfoQueryRequest';
import { Op, fn, col } from 'sequelize';
import { PageInfoVO } from '@/typings/model/vo/pageInfoVo';

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
  validFieldContent(content: string): Field {
    if (!content)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '内容不能为空');
    try {
      JSON.parse(content);
    } catch (error) {
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '内容格式错误');
    }
    const fulfillContent: Field = {
      fieldName: null,
      fieldType: null,
      defaultValue: null,
      notNull: null,
      comment: null,
      primaryKey: null,
      autoIncrement: null,
      mockParams: null,
      mockType: null,
      onUpdate: null,
    };
    const parseContent: Field = JSON.parse(content);
    const {
      fieldName,
      fieldType,
      defaultValue,
      notNull,
      comment,
      primaryKey,
      autoIncrement,
      mockParams,
      mockType,
      onUpdate,
    } = parseContent;
    if (!fieldName)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, 'fieldName 不能为空');
    fulfillContent.fieldName = fieldName;
    if (!fieldType)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, 'fieldType 不能为空');
    fulfillContent.fieldType = fieldType;
    if (defaultValue) fulfillContent.defaultValue = defaultValue;
    notNull
      ? (fulfillContent.notNull = true)
      : (fulfillContent.notNull = false);
    if (comment) fulfillContent.comment = comment;
    primaryKey
      ? (fulfillContent.primaryKey = true)
      : (fulfillContent.primaryKey = false);
    autoIncrement
      ? (fulfillContent.autoIncrement = true)
      : (fulfillContent.autoIncrement = false);
    if (mockParams) fulfillContent.mockParams = mockParams;
    if (mockType) fulfillContent.mockType = mockType;
    if (onUpdate) fulfillContent.onUpdate = onUpdate;
    return parseContent;
  }

  /**
   * 获取查询包装类
   * @param fieldInfoQueryRequest 查询请求
   */
  async getQueryWrapper(
    fieldInfoQueryRequest: FieldInfoQueryRequest
  ): Promise<PageInfoVO<Array<FieldInfo>>> {
    // 数据的偏移量
    let offset;
    const {
      name,
      fieldName,
      content,
      reviewStatus,
      reviewMessage,
      userId,
      pageSize,
      current,
    } = fieldInfoQueryRequest;
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
        [Op.like]: '%' + fieldInfoQueryRequest.name + '%',
      },
    };
    // fieldName 模糊查询条件
    const fieldNameLikeSelect = {
      fieldName: {
        [Op.like]: '%' + fieldInfoQueryRequest.fieldName + '%',
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
    // reviewMessage 查询条件
    const reviewMessageSelect = {
      reviewMessage: fieldInfoQueryRequest.reviewMessage,
    };
    // userId 查询条件
    const userIdSelect = {
      userId: fieldInfoQueryRequest.userId,
    };

    const result = await FieldInfo.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          fieldName ? fieldNameLikeSelect : null,
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
    ] = await FieldInfo.findAll({
      attributes: [[fn('COUNT', col('id')), 'total']],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          fieldName ? fieldNameLikeSelect : null,
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
   * 创建
   * @param name 字段名
   * @param content 字段内容
   * @return 字段 id
   */
  async addFieldInfo(
    name: string,
    content: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<number> {
    const parseContent = this.validFieldContent(content);
    const fieldObj = {
      name,
      fieldName: parseContent.fieldName,
      content,
      userId: this.ctx.userInfo.id,
    };
    if (reviewStatus) fieldObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) fieldObj['reviewMessage'] = reviewMessage;
    const result = await new FieldInfo({ ...fieldObj }).save();
    return result['null'];
  }

  /**
   * 删除
   * @param id 要删除的字段的 id
   */
  async deleteFieldInfo(id: number): Promise<boolean> {
    // 只有创建用户本人或者管理员才有权删除
    const curUserId = this.ctx.userInfo.userId;
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
    const updateObj = {};
    if (name) updateObj['name'] = name;
    if (fieldName) updateObj['fieldName'] = fieldName;
    if (content) {
      this.validFieldContent(content);
      updateObj['content'] = content;
    }
    if (reviewStatus || reviewStatus === 0)
      updateObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) updateObj['reviewMessage'] = reviewMessage;

    const result = await FieldInfo.update(updateObj, {
      where: { id },
    });
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

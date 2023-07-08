import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { DictService } from '../DictService';
import { Dict } from '@/model/entitys/dict';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { UserServiceImpl } from './UserServiceImpl';
import { DictQueryRequest } from '@/model/dto/DictQueryRequest';
import { Op, fn, col } from 'sequelize';
import { PageInfoVO } from '@/typings/model/vo/pageInfoVo';

@Provide()
export class DictServiceImpl implements DictService {
  @Inject()
  private ctx: Context;
  @Inject()
  private userServiceImpl: UserServiceImpl;

  /**
   * 处理 dict 中的 content 内容
   * @param content 用户输入的 content 内容
   * @return 处理完成后的 content 内容
   */
  handleDictContent(content: string): string {
    // 按逗号分割字符串
    const wordArr: string[] = content.split(/[,，]/);
    const handleWordArr = wordArr.map(item => {
      // 去除每一项的空格
      return item.trim();
    });
    return JSON.stringify(handleWordArr);
  }

  /**
   * 获取查询包装类
   * @param dictQueryRequest 查询请求
   */
  async getQueryWrapper(
    dictQueryRequest: DictQueryRequest
  ): Promise<PageInfoVO<Dict>> {
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
    } = dictQueryRequest;
    // 若 sortField 或者 sortOrder 为空，则让其分别为 id 和 ASC
    let { sortField, sortOrder } = dictQueryRequest;
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
        [Op.like]: '%' + dictQueryRequest.name + '%',
      },
    };
    // content 模糊查询条件
    const contentLikeSelect = {
      content: {
        [Op.like]: '%' + dictQueryRequest.content + '%',
      },
    };
    // reviewStatus 查询条件
    const reviewStatusSelect = {
      reviewStatus: dictQueryRequest.reviewStatus,
    };
    // reviewMessage 模糊查询条件
    const reviewMessageLikeSelect = {
      reviewMessage: {
        [Op.like]: '%' + dictQueryRequest.reviewMessage + '%',
      },
    };
    // userId 查询条件
    const userIdSelect = {
      userId: dictQueryRequest.userId,
    };

    const result = await Dict.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          content ? contentLikeSelect : null,
          reviewStatus || reviewStatus === 0 ? reviewStatusSelect : null,
          userId ? userIdSelect : null,
          reviewMessage ? reviewMessageLikeSelect : null,
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
    ] = await Dict.findAll({
      attributes: [[fn('COUNT', col('id')), 'total']],
      where: {
        [Op.and]: [
          name ? nameLikeSelect : null,
          content ? contentLikeSelect : null,
          reviewStatus ? reviewStatusSelect : null,
          userId ? userIdSelect : null,
          {
            isDelete: 0,
          },
        ],
      },
    });
    const resultArr: Dict[] = [];
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
   * 添加词库
   * @param dictName 词库名字
   * @param dictContent 词库内容
   * @param reviewStatus 状态
   * @param reviewMessage 审核信息
   * @return 插入的词条的 id
   */
  async addDict(
    dictName: string,
    dictContent: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<{ id: number }> {
    const curUserId = this.ctx.userInfo.id;
    const addDictObj = {
      name: dictName,
      content: dictContent,
      userId: curUserId,
    };
    if (reviewStatus) addDictObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) addDictObj['reviewMessage'] = reviewMessage;
    const result = await new Dict(addDictObj).save();
    if (result == null) throw new BusinessException(ErrorCode.OPERATION_ERROR);
    return { id: result['null'] };
  }

  /**
   * 删除一个词条
   * @param id 词条 id
   */
  async deleteDict(id: number): Promise<boolean> {
    // 仅为本人或者管理员才可以删除
    const curUserId = this.ctx.userInfo.id;
    const {
      dataValues: { userId },
    } = await Dict.findOne({
      attributes: ['userId'],
      where: { id },
    });
    if (curUserId !== userId && !this.userServiceImpl.isAdmin())
      throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
    const result = await Dict.update(
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
   * 更新一个词条
   * @param id 词条 id
   * @param name 词条名
   * @param content 词条内容
   * @param reviewStatus 审核状态
   * @param reviewMessage 审核信息
   */
  async updateDict(
    id: number,
    name: string,
    content: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<boolean> {
    const updateObj = {};
    if (name) updateObj['name'] = name;
    if (content) updateObj['content'] = content;
    if (reviewStatus) updateObj['reviewStatus'] = reviewStatus;
    if (reviewMessage) updateObj['reviewMessage'] = reviewMessage;
    const result = await Dict.update(
      {
        ...updateObj,
      },
      {
        where: { id },
      }
    );
    if (result[0] !== 1) throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    return true;
  }

  /**
   * 根据词库 id 获取
   * @param id 词库 id
   * @return 词库信息
   */
  async getDictById(id: number): Promise<Dict> {
    const result = await Dict.findOne({
      where: { id },
    });
    if (result == null) throw new BusinessException(ErrorCode.PARAMS_ERROR);
    return result.dataValues;
  }

  //#endregion
}

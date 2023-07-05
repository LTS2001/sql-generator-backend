import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { User } from '@/model/entitys/user';
import { Op, fn, col } from 'sequelize';
import { UserService } from '@/typings/service/UserService';
import { UserConstant } from '@/constant/UserConstant';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
import { decryptStr, encryptStr } from '@/utils/crypto';
import { UserUpdateRequest } from '@/model/dto/UserUpdateRequest';
import { UserQueryRequest } from '@/model/dto/UserQueryRequest';
import { PageInfoVO } from '@/typings/model/vo/pageInfoVo';

@Provide()
export class UserServiceImpl implements UserService {
  @Inject()
  private ctx: Context;

  /**
   * 用户注册
   * @param userName 用户名
   * @param userAccount 用户账号
   * @param userPassword 用户密码
   * @param checkPassword 校验密码
   * @param userRole 用户角色
   * @return 新用户 id
   */
  async userRegister(
    userName: string,
    userAccount: string,
    userPassword: string,
    checkPassword: string,
    userRole: string
  ): Promise<{ id: string }> {
    // 密码和校验密码需相同
    if (userPassword !== checkPassword)
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        '两次输入的密码不一致'
      );

    // 验证数据库中是否已存在相同的账号
    const userAccountList = await User.findAll({
      attributes: ['userAccount'],
    });
    const isExist = userAccountList.some(
      account => account.dataValues.userAccount === userAccount
    );
    if (isExist)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '该账号已经存在');
    // 密码加密
    const cryptoPassword = encryptStr(userPassword);
    // 存储到数据库
    const result = await new User({
      userName,
      userAccount,
      userRole,
      userPassword: cryptoPassword,
    }).save();
    return {
      id: result['null'],
    };
  }

  /**
   * 用户登录
   * @param userAccount 用户账号
   * @param userPassword 用户密码
   * @return 脱敏后的用户信息
   */
  async userLogin(userAccount: string, userPassword: string): Promise<User> {
    const userInfoList = await User.findAll({
      where: {
        userAccount,
      },
    });
    // 用户不存在
    if (userInfoList.length === 0)
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        '用户不存在或密码错误！'
      );

    const userInfo: User = userInfoList[0].dataValues;
    // 验证密码是否正确
    if (userPassword !== decryptStr(userInfo.userPassword))
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '密码或账号错误！');
    return { ...userInfo, userPassword: null } as User;
  }

  /**
   * 获取当前登录用户
   */
  getLoginUser(): User {
    // 先判断是否登录
    const currentUser = this.ctx.userInfo;
    if (currentUser == null)
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    return { ...currentUser, userPassword: null } as User;
  }

  /**
   * 是否为管理员
   */
  isAdmin(): boolean {
    const currentUser = this.ctx.userInfo;
    return (
      currentUser != null && currentUser.userRole === UserConstant.ADMIN_ROLE
    );
  }

  /**
   * 用户注销
   */
  userLogout(): boolean {
    const currentUser = this.ctx.userInfo;
    if (currentUser == null)
      throw new BusinessException(ErrorCode.OPERATION_ERROR, '未登录');
    return true;
  }

  /**
   * 删除用户
   * @param 需要删除的用户 id
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await User.update(
      {
        isDelete: 1,
      },
      {
        where: { id },
      }
    );
    if (result[0] === 0)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '删除失败');
    return true;
  }

  /**
   * 更新用户
   * @param 需要更新的用户信息
   */
  async updateUser(userUpdateInfo: UserUpdateRequest): Promise<boolean> {
    const handleUserInfo = { ...userUpdateInfo };
    if (userUpdateInfo.userPassword) {
      // 密码加密
      const cryptoPassword = encryptStr(userUpdateInfo.userPassword);
      handleUserInfo['userPassword'] = cryptoPassword;
    }

    const result = await User.update(handleUserInfo, {
      where: { id: userUpdateInfo.id },
    });
    if (result[0] === 0)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '更新失败');

    return true;
  }

  /**
   * 根据 id 获取用户
   */
  async getUser(id: number): Promise<User> {
    const result = await User.findOne({
      where: {
        id,
      },
    });
    if (result == null)
      throw new BusinessException(ErrorCode.PARAMS_ERROR, '该用户不存在！');
    return { ...result.dataValues, userPassword: null };
  }

  /**
   * 获取查询包装类
   * @param dictQueryRequest 查询请求
   */
  async getQueryWrapper(
    userQueryRequest: UserQueryRequest
  ): Promise<PageInfoVO<User>> {
    // 数据的偏移量
    let offset;
    const {
      userName,
      userAccount,
      gender,
      userRole,
      userAvatar,
      createTime,
      updateTime,
      pageSize,
      current,
    } = userQueryRequest;
    // 若 sortField 或者 sortOrder 为空，则让其分别为 id 和 ASC
    let { sortField, sortOrder } = userQueryRequest;
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
    // userName 模糊查询条件
    const userNameLikeSelect = {
      userName: {
        [Op.like]: '%' + userName + '%',
      },
    };
    // userAccount 模糊查询
    const userAccountLikeSelect = {
      userAccount: {
        [Op.like]: '%' + userAccount + '%',
      },
    };
    // userAvatar 模糊查询
    const userAvatarLikeSelect = {
      userAvatar: {
        [Op.like]: '%' + userAvatar + '%',
      },
    };
    // gender 模糊查询
    const genderLikeSelect = {
      gender: {
        [Op.like]: '%' + gender + '%',
      },
    };
    // userRole 模糊查询
    const userRoleLikeSelect = {
      userRole: {
        [Op.like]: '%' + userRole + '%',
      },
    };
    const result = await User.findAll({
      order: [[sortField, sortOrder]],
      where: {
        [Op.and]: [
          userName ? userNameLikeSelect : null,
          userAccount ? userAccountLikeSelect : null,
          userAvatar ? userAvatarLikeSelect : null,
          gender ? genderLikeSelect : null,
          userRole ? userRoleLikeSelect : null,
          createTime ? { createTime } : null,
          updateTime ? { updateTime } : null,
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
    ] = await User.findAll({
      attributes: [[fn('COUNT', col('id')), 'total']],
      where: {
        [Op.and]: [
          userName ? userNameLikeSelect : null,
          userAccount ? userAccountLikeSelect : null,
          userAvatar ? userAvatarLikeSelect : null,
          gender ? genderLikeSelect : null,
          userRole ? userRoleLikeSelect : null,
          createTime ? { createTime } : null,
          updateTime ? { updateTime } : null,
          {
            isDelete: 0,
          },
        ],
      },
    });
    const resultArr: User[] = [];
    result.forEach(item => {
      resultArr.push({ ...item.dataValues, userPassword: null });
    });
    return {
      current,
      total,
      size: pageSize,
      records: resultArr,
    };
  }
}

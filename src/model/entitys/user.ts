import {
  Table,
  Model,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'user',
})
export class User extends Model {
  /**
   * 主键 id
   */
  @Column({ primaryKey: true })
  id: bigint;

  /**
   * 用户名
   */
  @Column(DataType.STRING(256))
  userName: string;

  /**
   * 用户账号
   */
  @Column({
    type: DataType.STRING(256),
    allowNull: false,
  })
  userAccount: string;

  /**
   * 用户头像
   */
  @Column(DataType.STRING(1024))
  userAvatar: string;

  /**
   * 用户性别
   */
  @Column(DataType.TINYINT)
  gender: number;

  /**
   * 用户角色
   */
  @Column(DataType.STRING(256))
  userRole: string;

  /**
   * 用户密码
   */
  @Column(DataType.STRING(512))
  userPassword: string;

  /**
   * 创建时间
   */
  @CreatedAt
  createTime: Date;

  /**
   * 更新时间
   */
  @UpdatedAt
  updateTime: Date;

  /**
   * 是否删除
   */
  @Column(DataType.TINYINT)
  isDelete: number;
}

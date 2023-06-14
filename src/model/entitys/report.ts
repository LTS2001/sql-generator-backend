import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table
export class Report extends Model {
  /**
   * 主键 id
   */
  @Column({ primaryKey: true })
  id: bigint;

  /**
   * 举报内容
   */
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  /**
   * 举报实体类型（0-词库）
   */
  @Column({
    allowNull: false,
  })
  type: number;

  /**
   * 被举报对象 id
   */
  @Column({
    allowNull: false,
  })
  reportedId: bigint;

  /**
   * 被举报用户 id
   */
  @Column({
    allowNull: false,
  })
  reportedUserId: bigint;

  /**
   * 状态（0-未处理，1-已处理）
   */
  @Column
  status: number;

  /**
   * 创建用户 id
   */
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  userId: bigint;

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

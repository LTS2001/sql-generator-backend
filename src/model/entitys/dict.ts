import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'dict',
})
export class Dict extends Model {
  /**
   * 主键 id
   */
  @Column({ primaryKey: true })
  id: bigint;

  /**
   * 词库名称
   */
  @Column({
    type: DataType.STRING(512),
  })
  name: string;

  /**
   * 词库内容（JSON 数组）
   */
  @Column
  content: string;

  /**
   * 状态（0-待审核，1-通过，2-拒绝）
   */
  @Column
  reviewStatus: number;

  /**
   * 审核信息
   */
  @Column(DataType.STRING(512))
  reviewMessage: string;

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

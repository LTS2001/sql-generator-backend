import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'field_info',
})
export class FieldInfo extends Model {
  /**
   * 主键 id
   */
  @Column({ primaryKey: true })
  id: bigint;

  /**
   * 名称
   */
  @Column(DataType.STRING(512))
  name: string;

  /**
   * 字段名称
   */
  @Column(DataType.STRING(512))
  fieldName: string;

  /**
   * 字段信息（JSON）
   */
  @Column(DataType.TEXT)
  content: string;

  /**
   * 状态
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

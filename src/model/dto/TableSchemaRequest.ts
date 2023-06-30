import { Rule, RuleType, getSchema } from '@midwayjs/validate';

const strRule = RuleType.string();
const strReqRule = strRule.required();
/**
 * 列信息
 */
class Field {
  /**
   * 字段名
   */
  @Rule(strReqRule)
  fieldName: string;

  /**
   * 字段类型
   */
  @Rule(strReqRule)
  fieldType: string;

  /**
   * 默认值
   */
  @Rule(strRule)
  defaultValue: string;

  /**
   * 是否非空
   */
  @Rule(RuleType.boolean().required())
  notNull: boolean;

  /**
   * 注释（字段中文名）
   */
  @Rule(strRule)
  comment: string;

  /**
   * 是否为主键
   */
  @Rule(RuleType.boolean().required())
  primaryKey: boolean;

  /**
   * 是否自增
   */
  @Rule(RuleType.boolean().required())
  autoIncrement: boolean;

  /**
   * 模拟类型（随机、图片、规则、词库）
   */
  @Rule(strReqRule)
  mockType: string;

  /**
   * 模拟参数
   */
  @Rule(strRule)
  mockParams: string;

  /**
   * 附加条件
   */
  @Rule(strRule)
  onUpdate: string;
}

/**
 * 表概要类型定义
 */
export class TableSchemaRequest {
  /**
   * 库名
   */
  @Rule(strRule)
  dbName: string;

  /**
   * 表名
   */
  @Rule(strReqRule)
  tableName: string;

  /**
   * 表注释
   */
  @Rule(strRule)
  tableComment: string;

  /**
   * 模拟数据条数
   */
  @Rule(RuleType.number().required().max(30).min(5))
  mockNum: number;

  /**
   * 列信息
   */
  @Rule(RuleType.array().items(getSchema(Field)).required())
  fieldList: Field[];
}

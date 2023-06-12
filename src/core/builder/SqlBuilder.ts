import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { SqlDialectFactory } from './sql/SqlDialectFactory';
import { MockType } from '../model/enums/MockTypeEnum';
/**
 * SQL 生成器
 */
@Provide()
export class SqlBuilder {
  /**
   * SQL 方言工厂
   */
  @Inject()
  private sqlDialectFactory: SqlDialectFactory;

  /**
   * SQL 方言实例
   */
  private sqlDialectInstance: SqlDialect;

  @Inject()
  private ctx: Context;

  /**
   * 构造建表 SQL
   * @param tableSchema 表概要
   * @return 生成的 sql
   */
  async buildCreateTableSql(tableSchema: TableSchema): Promise<string> {
    // 获取对应数据库的方言实例
    this.sqlDialectInstance =
      this.sqlDialectFactory.getDialectInstance('MYSQL_DIALECT');
    if (this.sqlDialectInstance == null) {
      throw new Error('该数据库方言不存在');
    }
    // 构造表名
    let tableName = this.sqlDialectInstance.wrapTableName(
      tableSchema.tableName
    );
    if (tableSchema.dbName != null) {
      tableName = `\`${tableSchema.dbName}.${tableName}\``;
    }
    // 构造表前缀注释
    let tableComment = tableSchema.tableComment;
    if (tableComment == null) {
      tableComment = tableName;
    }
    const tablePrefixComment = `-- ${tableComment}`;
    // 表后缀注释
    const tableSuffixComment = `comment ${tableComment}`;
    // 构造表字段
    const fieldList: Field[] = tableSchema.fieldList;
    // 存放表字段（字符串数组）
    const arr_field_str: string[] = [];
    fieldList.forEach(field => {
      arr_field_str.push(this.buildCreateFieldSql(field));
    });
    return new Promise((resolve, reject) => {
      this.ctx
        .renderView('tableSql', {
          tablePrefixComment,
          tableSuffixComment,
          tableName,
          arr_field_str,
        })
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          reject(new Error(error.message));
        });
    });
  }
  /**
   * 生成创建字段的 SQL
   * @param field 字段
   * @return
   */
  buildCreateFieldSql(field: Field): string {
    if (field == null) {
      throw new Error('字段不能为空！');
    }
    const fieldName = this.sqlDialectInstance.wrapFieldName(field.fieldName);
    const fieldType = field.fieldType;
    const defaultValue = field.defaultValue;
    const notNull = field.notNull;
    const comment = field.comment;
    const onUpdate = field.onUpdate;
    const primaryKey = field.primaryKey;
    const autoIncrement = field.autoIncrement;
    // e.g. column_name int default 0 not null auto_increment comment '注释' primary key,
    const arr_field = new Array<string>();
    // 字段名
    arr_field.push(fieldName);
    // 字段类型
    arr_field.push(fieldType);
    // 默认值
    if (defaultValue != null) {
      arr_field.push(`default '${defaultValue}'`);
    }
    // 是否为空
    arr_field.push(notNull ? 'not null' : 'null');
    // 是否自增
    if (autoIncrement) {
      arr_field.push('auto_increment');
    }
    // 附加条件
    if (onUpdate != null) {
      arr_field.push(`on update ${onUpdate}`);
    }
    // 注释
    if (comment != null) {
      arr_field.push(`comment '${comment}'`);
    }
    // 是否为主键
    if (primaryKey) {
      arr_field.push('primary key');
    }
    return arr_field.join(' ');
  }

  /**
   * 构造插入数据 SQL 语句
   * e.g. INSERT INTO report (id, content) VALUES (1, '这个有点问题吧');
   * @param tableSchema 表概要
   * @param dataList 数据列表
   * @return SQL 插入语句的列表
   */
  buildInsertSql(
    tableSchema: TableSchema,
    dataList: Array<Map<string, string>>
  ): string {
    // 插入语句结果列表
    const insertSqlList = new Array<string>();
    // 构造表名
    let tableName = this.sqlDialectInstance.wrapTableName(
      tableSchema.tableName
    );
    if (tableSchema.dbName != null) {
      tableName = `\`${tableSchema.dbName}.${tableName}\``;
    }
    // 过滤掉 mockType=不模拟 的字段
    const fieldList = tableSchema.fieldList.filter(field => {
      return MockType[field.mockType] !== 'NONE';
    });
    const insertName: Array<string> = [];
    let insertValue: Array<string>;
    // 获取要插入的字段名
    fieldList.forEach(field => {
      insertName.push(field.fieldName);
    });
    // console.log('SqlBuilder.dataList', dataList);
    // 填充模板
    for (let i = 0; i < dataList.length; i++) {
      // 每次循环前，清空上一次的数据
      insertValue = [];
      insertName.forEach(fieldName => {
        insertValue.push(dataList[i].get(`${fieldName}`));
      });
      const insertNameStr = insertName.join(', ');
      const insertValueStr = insertValue.join(', ');
      const insertString = `INSERT INTO ${tableName} (${insertNameStr}) VALUES (${insertValueStr})`;
      insertSqlList.push(insertString);
    }
    return JSON.stringify(insertSqlList);
  }
}

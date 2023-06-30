import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { SqlDialectFactory } from './sql/SqlDialectFactory';
// import { MockType } from '../model/enums/MockTypeEnum';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';
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
    // 获取 MYSQL 数据库方言实例
    this.sqlDialectInstance =
      this.sqlDialectFactory.getDialectInstance('MYSQL_DIALECT');
    if (this.sqlDialectInstance == null) {
      throw new BusinessException(
        ErrorCode.NOT_FOUND_ERROR,
        '该数据库方言不存在'
      );
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
    const tableSuffixComment = `comment '${tableComment}'`;
    // 构造表字段
    const fieldList: Field[] = tableSchema.fieldList;
    // 存放表字段（字符串数组）
    const arr_field_str: string[] = [];
    fieldList.forEach(field => {
      arr_field_str.push(this.buildCreateFieldSql(field));
    });

    return await this.ctx.renderView('tableSql', {
      tablePrefixComment,
      tableSuffixComment,
      tableName,
      arr_field_str,
    });
  }

  /**
   * 生成创建字段的 SQL
   * @param field 字段
   * @return
   */
  buildCreateFieldSql(field: Field): string {
    const fieldName = this.sqlDialectInstance.wrapFieldName(field.fieldName);
    const fieldType = field.fieldType;
    const defaultValue = field.defaultValue;
    const notNull = field.notNull;
    const comment = field.comment;
    const onUpdate = field.onUpdate;
    const primaryKey = field.primaryKey;
    const autoIncrement = field.autoIncrement;
    // e.g. column_name int default 0 not null auto_increment comment '注释' primary key,
    const fieldArr = new Array<string>();
    // 字段名
    fieldArr.push(fieldName);
    // 字段类型
    fieldArr.push(fieldType);
    // 默认值
    if (defaultValue != null) {
      fieldArr.push(`default '${defaultValue}'`);
    }
    // 是否为空
    fieldArr.push(notNull ? 'not null' : 'null');
    // 是否自增
    if (autoIncrement) {
      fieldArr.push('auto_increment');
    }
    // 附加条件
    if (onUpdate != null) {
      fieldArr.push(`on update ${onUpdate}`);
    }
    // 注释
    if (comment != null) {
      fieldArr.push(`comment '${comment}'`);
    }
    // 是否为主键
    if (primaryKey) {
      fieldArr.push('primary key');
    }
    return fieldArr.join(' ');
  }

  /**
   * 构造插入数据 SQL 语句
   * e.g. INSERT INTO report (id, content) VALUES (1, '这个有点问题吧');
   * @param tableSchema 表概要
   * @param dataList 数据列表
   * @return SQL 插入语句的列表
   */
  buildInsertSql(tableSchema: TableSchema, dataList: Array<object>): string {
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
    // const fieldList = tableSchema.fieldList.filter(field => {
    //   return MockType[field.mockType] !== 'NONE';
    // });
    // 遍历 dataList 数组
    dataList.forEach(item => {
      const insertNameArr = [];
      const insertValueArr = [];
      // 遍历 dataList 中的每个对象
      for (const key in item as object) {
        insertNameArr.push(key);
        insertValueArr.push(item[key]);
      }
      const insertNameStr = insertNameArr.join(', ');
      const insertValueStr = insertValueArr.join(', ');
      const insertString = `INSERT INTO ${tableName} (${insertNameStr}) VALUES (${insertValueStr});`;
      insertSqlList.push(insertString);
    });
    return insertSqlList.join('\n');
  }
}

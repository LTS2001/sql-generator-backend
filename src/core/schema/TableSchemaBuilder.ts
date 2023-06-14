import { Provide, Inject } from '@midwayjs/core';
import { FieldInfo } from '@/model/entitys/fieldInfo';
import { Op } from 'sequelize';
import { Field, TableSchema } from './TableSchema';
import { Parser, Create } from 'node-sql-parser';
import xlsx from 'node-xlsx';

@Provide()
export class TableSchemaBuilder {
  @Inject()
  private tableSchema: TableSchema;
  /**
   * 智能构建
   * @param content 内容，使用逗号分割的字符串
   * @return tableSchema 表概要
   */
  async buildFormAuto({ content }: { content: string }): Promise<TableSchema> {
    if (content == null) {
      throw new Error('请求参数错误');
    }
    // 切分单词
    const words: string[] = content.split(/[,，]/);
    if (words == null || words.length > 20) {
      throw new Error('请求参数错误');
    }
    return new Promise((resolve, reject) => {
      // 根据单词去匹配列信息，未匹配到的使用默认值
      FieldInfo.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.or]: words,
              },
            },
            {
              fieldName: {
                [Op.or]: words,
              },
            },
          ],
        },
      })
        .then(fieldResult => {
          this.tableSchema.tableComment = '自动生成的表';
          this.tableSchema.tableName = 'my_table';
          words.forEach((word, i) => {
            let curField = new Field();
            // 等价于 fieldResult[i] && fieldResult[i]?.dataValues.name
            const name = fieldResult[i]?.dataValues.name;
            const fieldName = fieldResult[i]?.dataValues.fieldName;
            // 若字段表有次 word，则使用字段表的；否则使用默认的
            if (word === name || fieldName) {
              curField = JSON.parse(fieldResult[i].dataValues.content);
            } else {
              curField.autoIncrement = false;
              curField.comment = word;
              curField.defaultValue = '';
              curField.fieldName = word;
              curField.fieldType = 'text';
              curField.mockParams = '';
              curField.mockType = '';
              curField.notNull = false;
              curField.onUpdate = '';
              curField.primaryKey = false;
            }
            this.tableSchema.fieldList.push(curField);
          });
          resolve(this.tableSchema);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * 根据建表 SQL 构建，一次只处理一张表
   * @param 建表 SQL
   * @return tableSchema 表概要
   */
  buildFromSql({ sql }: { sql: string }): TableSchema {
    // 将 sql 语句转换成抽象语法树，从抽象语法树中提取出自己想要的东西
    let ast;
    try {
      ast = new Parser().astify(sql);
    } catch (error) {
      throw new Error(error.message);
    }
    // ast 返回一个数组对象，一个对象对应一张表
    const curTable: Create = ast[0];
    const tableSchema = new TableSchema();
    tableSchema.dbName = curTable.table[0].db;
    tableSchema.tableName = curTable.table[0].table;
    // 遍历 table_options 寻找 keyword 为 comment 的对象
    const opComment = curTable.table_options.filter(option => {
      return option.keyword === 'comment';
    });
    tableSchema.tableComment = opComment[0].value;
    try {
      // 循环遍历 ast 中的 create_definitions，并对其加工处理添加到 tableSchema 中的 fieldList
      curTable.create_definitions.forEach(definition => {
        const curField = new Field();
        curField.fieldName = definition.column.column;
        curField.fieldType = definition.definition.dataType.toLowerCase();
        curField.autoIncrement = definition.auto_increment ? true : false;
        curField.comment = definition.comment?.value?.value;
        curField.primaryKey = definition.unique_or_primary ? true : false;
        curField.notNull =
          definition.nullable?.type === 'not null' ? true : false;
        curField.defaultValue = definition.default_val?.value.value;
        curField.mockType = '不模拟';
        tableSchema.fieldList.push(curField);
      });
    } catch (error) {
      throw new Error(error.message);
    }
    return tableSchema;
  }

  /**
   * 根据 Excel 文件构建，一次只处理一张表
   * @param file Excel文件
   * @return 生成的 tableSchema
   */
  buildFromExcel(filePath: string): TableSchema {
    // {"name":"Sheet1","data":[["dbName","litaosehng"],["tableName","user"]]}
    const excelTable = xlsx.parse(filePath);
    const excelData = excelTable[0].data;
    // 验证传入的 excel 表格的头部字段是否正确
    const constantKey = [
      'dbName',
      'tableName',
      'tableComment',
      'mockNum',
      'fieldName',
      'fieldType',
      'defaultValue',
      'notNull',
      'comment',
      'primaryKey',
      'autoIncrement',
      'mockType',
      'mockParams',
      'onUpdate',
    ];
    const headerKeyArr = excelData[0];
    for (let i = 0; i < headerKeyArr.length; i++) {
      if (headerKeyArr[i] === constantKey[i] || 'fieldName*' || 'fieldType*') {
        continue;
      }
      throw new Error(
        '表格第一行传入的字段不正确，请认真检查后在重新发送请求！'
      );
    }
    // 根据解析后的 excel 数据生成 tableSchema
    const tableSchema = new TableSchema();
    // 获取第一个出现的 dbName
    tableSchema.dbName = excelData[1][0] ? excelData[1][0] : 'test_db';
    // 获取第一个出现的 tableName
    tableSchema.tableName = excelData[1][1] ? excelData[1][1] : 'test_table';
    // 获取第一个出现的 tableComment
    tableSchema.tableComment = excelData[1][2]
      ? excelData[1][2]
      : 'excel导入的表';
    // 获取第一个出现的 mockNum
    tableSchema.mockNum = excelData[1][3] ? excelData[1][3] : '10';
    // 遍历字段（遍历 excelData 二维数组）
    for (let i = 1; i < excelData.length; i++) {
      const curField = excelData[i];
      if (curField.length === 0) break;
      if (curField[4] == null || curField[5] == null) {
        throw new Error('fieldName 或 fieldType 不能为空');
      }
      const field = new Field();
      field.fieldName = curField[4];
      field.fieldType = curField[5];
      field.defaultValue = curField[6];
      field.notNull = curField[7] ? curField[7] : false;
      field.comment = curField[8];
      field.primaryKey = curField[9] ? curField[9] : false;
      field.autoIncrement = curField[10] ? curField[10] : false;
      field.mockType = curField[11] ? curField[11] : '不模拟';
      field.mockParams = curField[12];
      field.onUpdate = curField[13];
      tableSchema.fieldList.push(field);
    }
    return tableSchema;
  }
}

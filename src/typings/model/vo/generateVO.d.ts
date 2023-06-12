interface GenerateVO {
  tableSchema: TableSchema
  createSql: string
  dataList: Array<any>
  insertSql: string
  dataJson: string
  javaEntityCode: string
  javaObjectCode: string
  typescriptTypeCode: string
}
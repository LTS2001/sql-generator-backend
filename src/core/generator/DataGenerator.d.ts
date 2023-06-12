interface DataGenerate {
  /**
   * 数据生成接口
   * @param field 字段信息
   * @param rowNum 要生成数据的行数
   * @return 生成的数据列表
   */
  doGenerate(field: Field, rowNum: number): Array<string>;
}

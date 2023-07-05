export interface DictService {
  /**
   * 处理 dict 中的 content 内容
   * @param 待处理的 content 字符串
   * @return 处理完毕之后的 content 字符串
   */
  handleDictContent(content: string): string;

  /**
   * 添加一个词条
   * @param dictName 词条名
   * @param dictContent 词条内容
   */
  addDict(
    dictName: string,
    dictContent: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<{ id: number }>;

  /**
   * 删除一个词条
   * @param id 词条 id
   */
  deleteDict(id: number): Promise<boolean>;

  /**
   * 更新一个词条
   * @param id 词条 id
   * @param name 词条名
   * @param content 词条内容
   * @param reviewStatus 审核状态
   * @param reviewMessage 审核信息
   */
  updateDict(
    id: number,
    name: string,
    content: string,
    reviewStatus: number,
    reviewMessage: string
  ): Promise<boolean>;

  /**
   * 根据词库 id 获取
   * @param id 词库 id
   * @return 词库信息
   */
  getDictById(id: number): Promise<Dict>;
}

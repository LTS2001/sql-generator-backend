import { Inject, Provide, Scope, ScopeEnum, Init } from '@midwayjs/core';
import { MySqlDialect } from './MySqlDialect';
/**
 * sql 方言工厂
 * 工厂模式 + 单例模式，根据传入的方言名称来返回对应的数据库方言
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class SqlDialectFactory {
  /**
   * dialectName => 方言实例映射
   */
  private DIALECT_POOL: Map<string, SqlDialect> = new Map<string, SqlDialect>();

  /**
   * 注入 MYSQL 方言实例
   */
  @Inject()
  private mysqlDialect: MySqlDialect;

  /**
   * 初始加载 方言名 => 方言实例 的映射关系
   */
  @Init()
  initDialectInstanceMap() {
    this.DIALECT_POOL.set('MYSQL_DIALECT', this.mysqlDialect);
  }

  /**
   * 获取数据库方言实例
   * @param dialectName 方言名 => MYSQL_DIALECT
   */
  getDialectInstance(dialectName: string): SqlDialect {
    const dialect: SqlDialect = this.DIALECT_POOL.get(dialectName);
    return dialect;
  }
}

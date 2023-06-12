/**
 * 将一个字符串转化为大驼峰命名 / 小驼峰命名
 * @param upperName 需要转换的名字字符串
 * @param isUpper 是否为大驼峰命名
 */
export function upperCame(upperName: string, isUpper: boolean): string {
  // 将字符串分割成一个数组
  const tempNameArr = upperName.split('');
  const tempResultArr: string[] = [];
  for (let i = 0; i < tempNameArr.length; i++) {
    if (isUpper) {
      if (i === 0) {
        tempResultArr.push(tempNameArr[0].toUpperCase());
        continue;
      }
    }
    if (tempNameArr[i] === '_') {
      i++;
      tempResultArr.push(tempNameArr[i].toUpperCase());
      continue;
    }
    tempResultArr.push(tempNameArr[i]);
  }
  return tempResultArr.join('');
}

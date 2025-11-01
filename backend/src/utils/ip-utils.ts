/**
 * IP地址工具类
 * 提供IP地址计算、CIDR解析、范围计算等功能
 */

/**
 * CIDR块解析结果
 */
export interface CidrInfo {
  network: string; // 网络地址
  broadcast: string; // 广播地址
  firstHost: string; // 第一个可用主机地址
  lastHost: string; // 最后一个可用主机地址
  subnetMask: string; // 子网掩码
  prefixLength: number; // 前缀长度
  totalHosts: number; // 总主机数
  usableHosts: number; // 可用主机数（排除网络地址和广播地址）
}

/**
 * IP地址转换为数字
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IP address: ${ip}`);
  }
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

/**
 * 数字转换为IP地址
 */
export function numberToIp(num: number): string {
  if (num < 0 || num > 0xffffffff) {
    throw new Error(`Invalid IP number: ${num}`);
  }
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

/**
 * 验证IP地址格式
 */
export function isValidIp(ip: string): boolean {
  try {
    ipToNumber(ip);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证CIDR格式
 */
export function isValidCidr(cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) {
    return false;
  }
  const prefixLength = parseInt(parts[1], 10);
  return isValidIp(parts[0]) && prefixLength >= 0 && prefixLength <= 32;
}

/**
 * 解析CIDR块
 */
export function parseCidr(cidr: string): CidrInfo {
  if (!isValidCidr(cidr)) {
    throw new Error(`Invalid CIDR format: ${cidr}`);
  }

  const [network, prefixLengthStr] = cidr.split('/');
  const prefixLength = parseInt(prefixLengthStr, 10);

  const networkNum = ipToNumber(network);
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;
  const networkAddress = networkNum & mask;
  const broadcastAddress = networkAddress | (~mask >>> 0);
  const firstHost = networkAddress + 1;
  const lastHost = broadcastAddress - 1;
  const totalHosts = Math.pow(2, 32 - prefixLength);
  const usableHosts = totalHosts - 2; // 排除网络地址和广播地址

  // 计算子网掩码
  const subnetMask = numberToIp(mask);

  return {
    network: numberToIp(networkAddress),
    broadcast: numberToIp(broadcastAddress),
    firstHost: numberToIp(firstHost),
    lastHost: numberToIp(lastHost),
    subnetMask,
    prefixLength,
    totalHosts,
    usableHosts,
  };
}

/**
 * 生成IP地址范围内的所有IP地址
 */
export function generateIpRange(startIp: string, endIp: string): string[] {
  const start = ipToNumber(startIp);
  const end = ipToNumber(endIp);

  if (start > end) {
    throw new Error(`Start IP ${startIp} is greater than end IP ${endIp}`);
  }

  const ips: string[] = [];
  for (let i = start; i <= end; i++) {
    ips.push(numberToIp(i));
  }
  return ips;
}

/**
 * 从CIDR生成所有可用IP地址
 */
export function generateIpsFromCidr(cidr: string): string[] {
  const info = parseCidr(cidr);
  return generateIpRange(info.firstHost, info.lastHost);
}

/**
 * 检查IP地址是否在CIDR范围内
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const info = parseCidr(cidr);
  const ipNum = ipToNumber(ip);
  const firstHostNum = ipToNumber(info.firstHost);
  const lastHostNum = ipToNumber(info.lastHost);
  return ipNum >= firstHostNum && ipNum <= lastHostNum;
}

/**
 * 检查IP地址是否在范围内
 */
export function isIpInRange(ip: string, startIp: string, endIp: string): boolean {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(startIp);
  const endNum = ipToNumber(endIp);
  return ipNum >= startNum && ipNum <= endNum;
}

/**
 * 计算IP地址段的起始和结束IP
 */
export function calculateIpRange(
  startIp: string,
  rangeSize: number
): { startIp: string; endIp: string } {
  const startNum = ipToNumber(startIp);
  const endNum = startNum + rangeSize - 1;

  if (endNum > 0xffffffff) {
    throw new Error(`IP range exceeds maximum IP address`);
  }

  return {
    startIp,
    endIp: numberToIp(endNum),
  };
}

/**
 * 比较两个IP地址的大小
 * @returns 负数表示ip1 < ip2，0表示相等，正数表示ip1 > ip2
 */
export function compareIp(ip1: string, ip2: string): number {
  const num1 = ipToNumber(ip1);
  const num2 = ipToNumber(ip2);
  return num1 - num2;
}

/**
 * 检查IP地址是否连续
 */
export function areIpsContinuous(ips: string[]): boolean {
  if (ips.length <= 1) {
    return true;
  }

  const sortedIps = [...ips].sort(compareIp);
  for (let i = 1; i < sortedIps.length; i++) {
    const prevNum = ipToNumber(sortedIps[i - 1]);
    const currNum = ipToNumber(sortedIps[i]);
    if (currNum - prevNum !== 1) {
      return false;
    }
  }
  return true;
}


/**
 * Ceph RBD 客户端封装
 * 封装 Ceph RBD 操作接口，用于管理私有数据盘
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Ceph 配置接口
 */
export interface CephConfig {
  clusterName?: string;
  configPath?: string;
  keyringPath?: string;
  user?: string;
}

/**
 * RBD Image 信息接口
 */
export interface RBDImageInfo {
  name: string;
  size: number; // bytes
  format: number;
  features: string;
  flags: string;
}

/**
 * Ceph RBD 客户端类
 */
export class CephRBDClient {
  private clusterName: string;
  private configPath: string;
  private keyringPath?: string;
  private user: string;

  constructor(config?: CephConfig) {
    this.clusterName = config?.clusterName || process.env.CEPH_CLUSTER_NAME || 'ceph';
    this.configPath = config?.configPath || process.env.CEPH_CONFIG_PATH || '/etc/ceph/ceph.conf';
    this.keyringPath = config?.keyringPath || process.env.CEPH_KEYRING_PATH;
    this.user = config?.user || process.env.CEPH_USER || 'admin';
  }

  /**
   * 构建 rbd 命令的基础参数
   */
  private buildBaseArgs(): string[] {
    const args: string[] = ['rbd'];
    
    if (this.clusterName !== 'ceph') {
      args.push('--cluster', this.clusterName);
    }
    
    if (this.configPath) {
      args.push('--conf', this.configPath);
    }
    
    if (this.keyringPath) {
      args.push('--keyring', this.keyringPath);
    }
    
    if (this.user !== 'admin') {
      args.push('--user', this.user);
    }
    
    return args;
  }

  /**
   * 执行 rbd 命令
   */
  private async executeCommand(args: string[]): Promise<{ stdout: string; stderr: string }> {
    const cmd = [...this.buildBaseArgs(), ...args].join(' ');
    
    try {
      const result = await execAsync(cmd);
      return result;
    } catch (error: any) {
      // 提取错误信息
      const errorMessage = error.stderr || error.message || 'Unknown error';
      throw new Error(`Ceph RBD command failed: ${errorMessage}`);
    }
  }

  /**
   * 创建 RBD image（虚拟磁盘）
   * @param pool 存储池名称
   * @param imageName image 名称
   * @param sizeGb 大小（GB）
   * @param features RBD features（可选）
   */
  async createImage(
    pool: string,
    imageName: string,
    sizeGb: number,
    features?: string
  ): Promise<void> {
    const args = ['create', `${pool}/${imageName}`, '--size', `${sizeGb}G`];
    
    if (features) {
      args.push('--image-feature', features);
    } else {
      // 默认启用 layering（支持快照和克隆）
      args.push('--image-feature', 'layering');
    }
    
    await this.executeCommand(args);
  }

  /**
   * 删除 RBD image
   * @param pool 存储池名称
   * @param imageName image 名称
   */
  async deleteImage(pool: string, imageName: string): Promise<void> {
    const args = ['rm', `${pool}/${imageName}`];
    await this.executeCommand(args);
  }

  /**
   * 扩容 RBD image
   * @param pool 存储池名称
   * @param imageName image 名称
   * @param newSizeGb 新大小（GB）
   * @param allowShrink 是否允许缩容（默认 false）
   */
  async resizeImage(
    pool: string,
    imageName: string,
    newSizeGb: number,
    allowShrink: boolean = false
  ): Promise<void> {
    const args = ['resize', `${pool}/${imageName}`, '--size', `${newSizeGb}G`];
    
    if (allowShrink) {
      args.push('--allow-shrink');
    }
    
    await this.executeCommand(args);
  }

  /**
   * 创建快照
   * @param pool 存储池名称
   * @param imageName image 名称
   * @param snapshotName 快照名称
   */
  async createSnapshot(
    pool: string,
    imageName: string,
    snapshotName: string
  ): Promise<void> {
    const args = ['snap', 'create', `${pool}/${imageName}@${snapshotName}`];
    await this.executeCommand(args);
  }

  /**
   * 删除快照
   * @param pool 存储池名称
   * @param imageName image 名称
   * @param snapshotName 快照名称
   */
  async deleteSnapshot(
    pool: string,
    imageName: string,
    snapshotName: string
  ): Promise<void> {
    const args = ['snap', 'rm', `${pool}/${imageName}@${snapshotName}`];
    await this.executeCommand(args);
  }

  /**
   * 从快照克隆 image
   * @param pool 存储池名称
   * @param sourceImageName 源 image 名称
   * @param snapshotName 快照名称
   * @param destImageName 目标 image 名称
   * @param features RBD features（可选）
   */
  async cloneImage(
    pool: string,
    sourceImageName: string,
    snapshotName: string,
    destImageName: string,
    features?: string
  ): Promise<void> {
    const args = [
      'clone',
      `${pool}/${sourceImageName}@${snapshotName}`,
      `${pool}/${destImageName}`
    ];
    
    if (features) {
      args.push('--image-feature', features);
    } else {
      args.push('--image-feature', 'layering');
    }
    
    await this.executeCommand(args);
  }

  /**
   * 列出存储池中的所有 images
   * @param pool 存储池名称
   * @returns image 名称列表
   */
  async listImages(pool: string): Promise<string[]> {
    const args = ['ls', pool];
    const result = await this.executeCommand(args);
    
    // 解析输出，每行一个 image 名称
    return result.stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * 获取 image 信息
   * @param pool 存储池名称
   * @param imageName image 名称
   * @returns image 信息
   */
  async getImageInfo(pool: string, imageName: string): Promise<RBDImageInfo> {
    const args = ['info', `${pool}/${imageName}`, '--format', 'json'];
    const result = await this.executeCommand(args);
    
    try {
      const info = JSON.parse(result.stdout);
      return {
        name: info.name || imageName,
        size: parseInt(info.size || '0', 10),
        format: parseInt(info.format || '2', 10),
        features: info.features || '',
        flags: info.flags || ''
      };
    } catch (error) {
      throw new Error(`Failed to parse RBD image info: ${error}`);
    }
  }

  /**
   * 检查 image 是否存在
   * @param pool 存储池名称
   * @param imageName image 名称
   * @returns 是否存在
   */
  async imageExists(pool: string, imageName: string): Promise<boolean> {
    try {
      await this.getImageInfo(pool, imageName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取 image 大小（GB）
   * @param pool 存储池名称
   * @param imageName image 名称
   * @returns 大小（GB）
   */
  async getImageSizeGb(pool: string, imageName: string): Promise<number> {
    const info = await this.getImageInfo(pool, imageName);
    // size 是字节，转换为 GB
    return Math.ceil(info.size / (1024 * 1024 * 1024));
  }

  /**
   * 列出 image 的所有快照
   * @param pool 存储池名称
   * @param imageName image 名称
   * @returns 快照名称列表
   */
  async listSnapshots(pool: string, imageName: string): Promise<string[]> {
    const args = ['snap', 'ls', `${pool}/${imageName}`, '--format', 'json'];
    
    try {
      const result = await this.executeCommand(args);
      const snapshots = JSON.parse(result.stdout);
      
      if (Array.isArray(snapshots)) {
        return snapshots.map((snap: any) => snap.name || '');
      }
      
      return [];
    } catch (error) {
      // 如果没有快照，命令可能返回非零退出码
      return [];
    }
  }
}

// 导出单例实例
export const cephRBDClient = new CephRBDClient();

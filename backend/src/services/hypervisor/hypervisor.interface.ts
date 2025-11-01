/**
 * 虚拟化平台适配器接口 (Hypervisor Adapter Interface)
 * 定义统一的虚拟化平台操作接口
 */

/**
 * 虚拟机配置
 */
export interface VmConfig {
  name: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  gpuCount?: number;
  imageId?: string;
  imageVersionId?: string;
  networkConfig?: {
    vpcId?: string;
    subnetId?: string;
    ipAddress?: string;
    macAddress?: string;
  };
  userData?: string;
}

/**
 * 虚拟机信息
 */
export interface VmInfo {
  uuid: string;
  name: string;
  status: 'running' | 'stopped' | 'paused' | 'error' | 'unknown';
  ipAddress?: string;
  macAddress?: string;
}

/**
 * 虚拟化平台适配器接口
 */
export interface HypervisorAdapter {
  /**
   * 创建虚拟机
   */
  createVm(config: VmConfig): Promise<VmInfo>;

  /**
   * 启动虚拟机
   */
  startVm(vmUuid: string): Promise<void>;

  /**
   * 停止虚拟机
   */
  stopVm(vmUuid: string): Promise<void>;

  /**
   * 重启虚拟机
   */
  restartVm(vmUuid: string): Promise<void>;

  /**
   * 删除虚拟机
   */
  deleteVm(vmUuid: string): Promise<void>;

  /**
   * 获取虚拟机信息
   */
  getVmInfo(vmUuid: string): Promise<VmInfo>;

  /**
   * 获取虚拟机状态
   */
  getVmStatus(vmUuid: string): Promise<string>;

  /**
   * 测试连接
   */
  testConnection(): Promise<boolean>;
}


/**
 * 虚拟化平台适配器工厂 (Hypervisor Adapter Factory)
 * 根据算力机的虚拟化平台类型创建对应的适配器
 */

import { HypervisorAdapter } from './hypervisor.interface';
import { KvmAdapter } from './kvm-adapter';
import { VmwareAdapter } from './vmware-adapter';
import { HyperVAdapter } from './hyper-v-adapter';
import { HypervisorType } from '@prisma/client';

/**
 * 创建虚拟化平台适配器
 */
export class HypervisorFactory {
  static createAdapter(
    hypervisorType: HypervisorType,
    connectionConfig: any
  ): HypervisorAdapter {
    switch (hypervisorType) {
      case HypervisorType.KVM:
        return new KvmAdapter(connectionConfig);
      case HypervisorType.VMWARE:
        return new VmwareAdapter(connectionConfig);
      case HypervisorType.HYPER_V:
        return new HyperVAdapter(connectionConfig);
      default:
        throw new Error(`Unsupported hypervisor type: ${hypervisorType}`);
    }
  }
}


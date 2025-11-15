/**
 * Image-related type definitions for the Zedge Cloud Desktop Platform
 */

/**
 * Image usage type
 */
export enum ImageUsage {
  GENERAL_OFFICE = 'general_office',  // 普通办公
  AI_TRAINING = 'ai_training',        // AI训练
  GRAPHIC_DESIGN = 'graphic_design',  // 图形设计
}

/**
 * Base image data structure
 */
export interface BaseImage {
  id: string
  imageNumber: string      // 镜像编号
  imageName: string        // 镜像名称
  os: string               // 操作系统
  preInstalledSoftware: string  // 预装软件描述
  systemSize: string       // 系统大小
  maxStorageSize: string   // 最大配置
  status: string           // 操作/状态
}

/**
 * Pre-installed software data structure
 */
export interface PreInstalledSoftware {
  id: string
  softwareName: string     // 软件名称
  softwareDescription: string  // 软件描述
  version: string          // 版本号
  status: string           // 操作/状态
}

/**
 * New image form data
 */
export interface NewImageFormData {
  // Usage selection
  usage: ImageUsage

  // Selected base image
  selectedBaseImage: BaseImage | null

  // Selected software list
  selectedSoftware: PreInstalledSoftware[]

  // Basic info
  name: string             // 名称
  version: string          // 版本
  operatingSystem: string  // 操作系统配置

  // Advanced config
  cpuCores: string         // CPU核心数
  hardDiskCapacity: string // 硬盘容量
  internalStorage: string  // 内存容量
}

/**
 * Initial form data
 */
export const initialNewImageFormData: NewImageFormData = {
  usage: ImageUsage.GENERAL_OFFICE,
  selectedBaseImage: null,
  selectedSoftware: [],
  name: '',
  version: '',
  operatingSystem: '',
  cpuCores: '',
  hardDiskCapacity: '',
  internalStorage: '',
}

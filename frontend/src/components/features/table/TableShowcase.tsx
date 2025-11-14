/**
 * Figma DeskPro Table Component Showcase
 *
 * Source: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=105-2658
 *
 * This file showcases table components matching the Figma design:
 * - Table with various cell types
 * - Header cells with dividers
 * - Text cells
 * - Checkbox/select cells
 * - Dropdown cells
 * - Action cells with buttons
 * - Enum/badge cells
 */

import React, { useState } from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableTextCell,
  TableSelectCell,
  TableDropdownCell,
  TableActionCell,
  TableEnumCell,
} from '../../ui'

interface InstanceData {
  id: string
  name: string
  version: string
  status: 'running' | 'stopped' | 'error' | 'creating'
  cpu: string
  memory: string
}

const mockInstances: InstanceData[] = [
  { id: '1', name: 'Instance-001', version: '24.0.7', status: 'running', cpu: '4 cores', memory: '8 GB' },
  { id: '2', name: 'Instance-002', version: '23.1.5', status: 'stopped', cpu: '2 cores', memory: '4 GB' },
  { id: '3', name: 'Instance-003', version: '24.0.7', status: 'creating', cpu: '8 cores', memory: '16 GB' },
  { id: '4', name: 'Instance-004', version: '22.0.3', status: 'error', cpu: '4 cores', memory: '8 GB' },
]

const statusVariantMap = {
  running: 'success' as const,
  stopped: 'default' as const,
  creating: 'info' as const,
  error: 'error' as const,
}

const statusLabelMap = {
  running: '运行中',
  stopped: '已停止',
  creating: '创建中',
  error: '错误',
}

export function TableShowcase() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(mockInstances.map((i) => i.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const handleVersionChange = (id: string, version: string) => {
    console.log(`Instance ${id} version changed to ${version}`)
  }

  const handleViewDetails = (id: string) => {
    console.log(`View details for instance ${id}`)
  }

  const handleMoreActions = (id: string) => {
    console.log(`More actions for instance ${id}`)
  }

  const allSelected = selectedRows.size === mockInstances.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < mockInstances.length

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">
          Figma Table Components (node-id: 105-2658)
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Complete table system with headers, text cells, checkboxes, dropdowns, actions, and badges
        </p>
      </div>

      {/* Full Featured Table */}
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-3">
          Complete Table Example - Instance Management
        </p>
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell showDivider>
                  <TableSelectCell
                    as="div"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHeaderCell>
                <TableHeaderCell showDivider>实例名称</TableHeaderCell>
                <TableHeaderCell showDivider>版本</TableHeaderCell>
                <TableHeaderCell showDivider>CPU</TableHeaderCell>
                <TableHeaderCell showDivider>内存</TableHeaderCell>
                <TableHeaderCell showDivider>状态</TableHeaderCell>
                <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockInstances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableSelectCell
                    checked={selectedRows.has(instance.id)}
                    onCheckedChange={(checked) => handleSelectRow(instance.id, checked)}
                  />
                  <TableTextCell>{instance.name}</TableTextCell>
                  <TableDropdownCell
                    value={instance.version}
                    options={['24.0.7', '23.1.5', '22.0.3', '21.0.1']}
                    onChange={(value) => handleVersionChange(instance.id, value)}
                  />
                  <TableTextCell>{instance.cpu}</TableTextCell>
                  <TableTextCell>{instance.memory}</TableTextCell>
                  <TableEnumCell variant={statusVariantMap[instance.status]}>
                    {statusLabelMap[instance.status]}
                  </TableEnumCell>
                  <TableActionCell
                    actionText="详情"
                    onAction={() => handleViewDetails(instance.id)}
                    onMore={() => handleMoreActions(instance.id)}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 text-xs text-neutral-600">
          Selected: {selectedRows.size} / {mockInstances.length} instances
        </div>
      </div>

      {/* Individual Cell Type Examples */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Table Header Cell (node-id: 105:2653)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell showDivider>Header 1</TableHeaderCell>
                  <TableHeaderCell showDivider>Header 2</TableHeaderCell>
                  <TableHeaderCell showDivider={false}>Header 3</TableHeaderCell>
                </TableRow>
              </TableHead>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Text Cell (node-id: 105:2657)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableBody>
                <TableRow>
                  <TableTextCell>Cell Text 1</TableTextCell>
                  <TableTextCell>Cell Text 2</TableTextCell>
                  <TableTextCell>Cell Text 3</TableTextCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Select/Checkbox Cell (node-id: 197:724)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableBody>
                <TableRow>
                  <TableSelectCell checked={false} />
                  <TableSelectCell checked={true} />
                  <TableSelectCell checked={false} indeterminate={true} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Dropdown Cell (node-id: 279:1076)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableBody>
                <TableRow>
                  <TableDropdownCell value="24.0.7" options={['24.0.7', '23.1.5', '22.0.3']} />
                  <TableDropdownCell value="Option 1" options={['Option 1', 'Option 2', 'Option 3']} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Action Cell (node-id: 389:1274)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableBody>
                <TableRow>
                  <TableActionCell actionText="详情" showMore />
                  <TableActionCell actionText="编辑" showMore />
                  <TableActionCell actionText="查看" showMore={false} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Enum/Badge Cell (node-id: 448:1318)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden inline-block">
            <Table>
              <TableBody>
                <TableRow>
                  <TableEnumCell variant="default">状态</TableEnumCell>
                  <TableEnumCell variant="success">运行中</TableEnumCell>
                  <TableEnumCell variant="warning">警告</TableEnumCell>
                  <TableEnumCell variant="error">错误</TableEnumCell>
                  <TableEnumCell variant="info">创建中</TableEnumCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Design Specs */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Design Specs</h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Table Header: 12.5px Bold, 46px height, #ececf0 border, white background</li>
          <li>• Text Cell: 12.5px Medium, 8px padding, -0.1504px letter spacing</li>
          <li>• Checkbox Cell: 20px square, #767575 border, centered</li>
          <li>• Dropdown Cell: #f3f3f5 background, 8px border radius, 9px horizontal padding</li>
          <li>• Action Cell: 12.5px Medium, vertical divider (#d9d9d9), more icon</li>
          <li>• Badge/Enum Cell: 6.75px border radius, 8px horizontal padding, 3px vertical</li>
          <li>• Row Border: Bottom border only, #ececf0 color</li>
          <li>• Row Hover: Light neutral background (#f8fafc)</li>
        </ul>
      </div>

      {/* Usage Guide */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">Usage Example</h4>
        <pre className="text-xs text-primary-800 overflow-x-auto">
{`import {
  Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableTextCell, TableSelectCell,
  TableDropdownCell, TableActionCell, TableEnumCell
} from '@/components/ui'

<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableTextCell>Instance-001</TableTextCell>
      <TableEnumCell variant="success">Running</TableEnumCell>
    </TableRow>
  </TableBody>
</Table>`}
        </pre>
      </div>
    </div>
  )
}

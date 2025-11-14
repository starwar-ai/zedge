/**
 * Figma DeskPro Form Component Showcase
 *
 * Source: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=97-1631
 *
 * This file showcases form components matching the Figma design:
 * - FormInput: Single-line text input with label
 * - FormTextarea: Multi-line text input
 * - FormSelect: Dropdown select
 * - FormMultiSelect: Multi-select dropdown with checkboxes
 * - FormCheckbox: Checkbox with label
 * - FormLabel: Read-only label-value pair
 * - FormGroup: Layout container for forms
 */

import React, { useState } from 'react'
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormMultiSelect,
  FormCheckbox,
  FormLabel,
  FormGroup,
  Button,
} from '../../ui'

export function FormShowcase() {
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [nameError, setNameError] = useState('')

  // Validation example
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (value.length < 3 && value.length > 0) {
      setNameError('Name must be at least 3 characters')
    } else {
      setNameError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', { name, description, version, roles, agreeToTerms })
  }

  const versionOptions = [
    { label: '24.0.7', value: '24.0.7' },
    { label: '23.1.5', value: '23.1.5' },
    { label: '22.0.3', value: '22.0.3' },
    { label: '21.0.1', value: '21.0.1' },
  ]

  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '操作员', value: 'operator' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">
          Figma Form Components (node-id: 97-1631)
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Complete form system with inputs, textareas, selects, multi-selects, checkboxes, and labels
        </p>
      </div>

      {/* Complete Form Example */}
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-3">
          Complete Form Example - Instance Configuration
        </p>
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormInput
                label="实例名称："
                placeholder="请输入实例名称"
                value={name}
                onChange={handleNameChange}
                error={nameError}
              />

              <FormTextarea
                label="描述："
                placeholder="请输入描述信息"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <FormSelect
                label="版本"
                placeholder="请选择版本"
                options={versionOptions}
                value={version}
                onChange={setVersion}
              />

              <FormMultiSelect
                label="角色："
                placeholder="请选择角色"
                options={roleOptions}
                value={roles}
                onChange={setRoles}
              />

              <FormCheckbox
                label="同意服务条款"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
              />

              <FormLabel label="创建时间" content="2025-11-14 10:30:00" />

              <div className="flex gap-3 pt-4">
                <Button variant="primary" type="submit">
                  提交
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setName('')
                    setDescription('')
                    setVersion('')
                    setRoles([])
                    setAgreeToTerms(false)
                    setNameError('')
                  }}
                >
                  重置
                </Button>
              </div>
            </FormGroup>
          </form>
          <div className="mt-6 p-4 bg-neutral-50 rounded">
            <p className="text-xs font-semibold text-neutral-700 mb-2">Form State:</p>
            <pre className="text-xs text-neutral-600 overflow-x-auto">
              {JSON.stringify({ name, description, version, roles, agreeToTerms }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Individual Component Examples */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Input (node-id: 97:1630)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormInput label="标签：" placeholder="placeholder" />
            <FormInput label="错误状态：" placeholder="Enter text" error="This field is required" />
            <FormInput label="禁用状态：" placeholder="Disabled" disabled />
            <FormInput showLabel={false} placeholder="No label" />
            <FormInput label="全宽：" placeholder="Full width input" fullWidth />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Textarea (node-id: 453:451)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormTextarea label="描述：" placeholder="请输入描述信息" />
            <FormTextarea
              label="错误："
              placeholder="Enter text"
              error="Content is too short"
            />
            <FormTextarea label="禁用：" placeholder="Disabled" disabled />
            <FormTextarea label="全宽：" placeholder="Full width textarea" fullWidth />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Select (node-id: 365:1163)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormSelect
              label="版本"
              placeholder="请选择"
              options={versionOptions}
              value={version}
              onChange={setVersion}
            />
            <FormSelect
              label="错误："
              placeholder="placeholder"
              options={versionOptions}
              error="Please select an option"
            />
            <FormSelect
              showLabel={false}
              placeholder="No label"
              options={versionOptions}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Multi-Select (node-id: 356:703)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormMultiSelect
              label="角色："
              placeholder="请选择角色"
              options={roleOptions}
              value={roles}
              onChange={setRoles}
            />
            <FormMultiSelect
              label="错误："
              placeholder="请选择"
              options={roleOptions}
              error="At least one role is required"
            />
            <div className="text-xs text-neutral-600 mt-2">
              Selected: {roles.length > 0 ? roles.join(', ') : 'None'}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Checkbox (node-id: 433:4818)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormCheckbox label="Checkbox Label" checked={false} />
            <FormCheckbox label="Checked" checked={true} />
            <FormCheckbox label="Disabled" checked={false} disabled />
            <FormCheckbox label="Checked & Disabled" checked={true} disabled />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Form Label - Read-only (node-id: 427:1236)
          </p>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
            <FormLabel label="Label" content="Content" />
            <FormLabel label="实例 ID" content="inst-abc123" />
            <FormLabel label="创建时间" content="2025-11-14 10:30:00" />
            <FormLabel label="状态" content="运行中" />
          </div>
        </div>
      </div>

      {/* Design Specs */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Design Specs</h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Label: 12.5px Regular, 22px line height, 1px letter spacing, 80px width</li>
          <li>• Input/Textarea: 28px height (input), white background, #ececf0 border</li>
          <li>• Input text: 12.5px Regular, #717182 placeholder color</li>
          <li>• Select button: 28px height, #f3f3f5 background (dropdown), white background (main)</li>
          <li>• Multi-select: #fafafa dropdown background, 2x2px color indicators</li>
          <li>• Checkbox: 20px square, #767575 border</li>
          <li>• Error text: Extra small, error-600 color, 4px top margin</li>
          <li>• Default width: 299px (input/textarea), 306px (multi-select)</li>
          <li>• Gap between label and input: 8px (gap-2)</li>
          <li>• Border radius: 4px (rounded)</li>
        </ul>
      </div>

      {/* Usage Guide */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">Usage Example</h4>
        <pre className="text-xs text-primary-800 overflow-x-auto">
{`import {
  FormInput, FormTextarea, FormSelect, FormMultiSelect,
  FormCheckbox, FormLabel, FormGroup
} from '@/components/ui'

function MyForm() {
  const [name, setName] = useState('')
  const [roles, setRoles] = useState<string[]>([])

  return (
    <form>
      <FormGroup>
        <FormInput
          label="Name："
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={name.length < 3 ? 'Too short' : ''}
        />

        <FormMultiSelect
          label="Roles："
          options={[
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' }
          ]}
          value={roles}
          onChange={setRoles}
        />

        <FormCheckbox
          label="Agree to terms"
          checked={agreed}
          onCheckedChange={setAgreed}
        />

        <FormLabel label="Created" content="2025-11-14" />
      </FormGroup>
    </form>
  )
}`}
        </pre>
      </div>
    </div>
  )
}

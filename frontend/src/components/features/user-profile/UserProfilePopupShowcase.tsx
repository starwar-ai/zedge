import React, { useState } from 'react'
import { UserProfilePopup, Organization } from './UserProfilePopup'

/**
 * UserProfilePopup Showcase Component
 *
 * Demonstrates the UserProfilePopup component with sample data
 * Figma node-id: 553-9362
 */
export function UserProfilePopupShowcase() {
  const [lastAction, setLastAction] = useState<string>('')

  // Sample user data
  const sampleUser = {
    userName: '张三峰',
    userEmail: 'xyz@123.com',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
  }

  // Sample organizations
  const sampleOrganizations: Organization[] = [
    {
      id: '1',
      name: '山东科技大学',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SDUST',
    },
    {
      id: '2',
      name: '山东大学',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SDU',
    },
  ]

  const handleSettingsClick = () => {
    setLastAction('Settings clicked')
    console.log('Settings clicked')
  }

  const handleLogoutClick = () => {
    setLastAction('Logout clicked')
    console.log('Logout clicked')
  }

  const handleOrganizationClick = (org: Organization) => {
    setLastAction(`Organization clicked: ${org.name}`)
    console.log('Organization clicked:', org)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-neutral-900">
          User Profile Popup (Figma node-id: 553-9362)
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Dark-themed user profile popup with settings, organizations, and logout
        </p>
        <a
          href="https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=553-9362"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 hover:underline"
        >
          View in Figma →
        </a>
      </div>

      {/* Live Demo */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-neutral-700">Live Demo</h4>

        {/* Dark background to showcase the popup */}
        <div className="flex items-start justify-center p-8 bg-neutral-800 rounded-lg">
          <UserProfilePopup
            userName={sampleUser.userName}
            userEmail={sampleUser.userEmail}
            userAvatar={sampleUser.userAvatar}
            organizations={sampleOrganizations}
            onSettingsClick={handleSettingsClick}
            onLogoutClick={handleLogoutClick}
            onOrganizationClick={handleOrganizationClick}
            className="max-w-[320px]"
          />
        </div>

        {/* Last Action Display */}
        {lastAction && (
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-md">
            <p className="text-xs text-primary-800">
              <strong>Last Action:</strong> {lastAction}
            </p>
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-neutral-700">Variants</h4>

        {/* Without Organizations */}
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Without Organizations
          </p>
          <div className="flex items-start justify-center p-8 bg-neutral-800 rounded-lg">
            <UserProfilePopup
              userName={sampleUser.userName}
              userEmail={sampleUser.userEmail}
              userAvatar={sampleUser.userAvatar}
              organizations={[]}
              onSettingsClick={handleSettingsClick}
              onLogoutClick={handleLogoutClick}
              className="max-w-[320px]"
            />
          </div>
        </div>

        {/* With Many Organizations */}
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            With Multiple Organizations
          </p>
          <div className="flex items-start justify-center p-8 bg-neutral-800 rounded-lg">
            <UserProfilePopup
              userName={sampleUser.userName}
              userEmail={sampleUser.userEmail}
              userAvatar={sampleUser.userAvatar}
              organizations={[
                ...sampleOrganizations,
                {
                  id: '3',
                  name: '清华大学',
                  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=THU',
                },
                {
                  id: '4',
                  name: '北京大学',
                  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=PKU',
                },
              ]}
              onSettingsClick={handleSettingsClick}
              onLogoutClick={handleLogoutClick}
              onOrganizationClick={handleOrganizationClick}
              className="max-w-[320px]"
            />
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">Usage Example</h4>
        <pre className="text-xs text-primary-800 overflow-x-auto">
{`import { UserProfilePopup, Organization } from '@/components/features/user-profile'

const organizations: Organization[] = [
  {
    id: '1',
    name: '山东科技大学',
    avatarUrl: '/avatars/org1.png',
  },
  {
    id: '2',
    name: '山东大学',
    avatarUrl: '/avatars/org2.png',
  },
]

function MyComponent() {
  const handleSettingsClick = () => {
    // Navigate to settings
    router.push('/settings')
  }

  const handleLogoutClick = () => {
    // Perform logout
    logout()
  }

  const handleOrganizationClick = (org: Organization) => {
    // Navigate to organization
    router.push(\`/organizations/\${org.id}\`)
  }

  return (
    <UserProfilePopup
      userName="张三峰"
      userEmail="xyz@123.com"
      userAvatar="/avatars/user.png"
      organizations={organizations}
      onSettingsClick={handleSettingsClick}
      onLogoutClick={handleLogoutClick}
      onOrganizationClick={handleOrganizationClick}
    />
  )
}`}
        </pre>
      </div>

      {/* Design Specs */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Design Specs</h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Background Color: #1e1e1e (dark theme)</li>
          <li>• Border Radius: 16px (rounded-card)</li>
          <li>• Padding: 12px (p-card)</li>
          <li>• User Avatar Size: 52px × 52px</li>
          <li>• Organization Avatar Size: 25px × 25px</li>
          <li>• Text Primary: White (#ffffff)</li>
          <li>• Text Secondary: Neutral-300 (#d4d4d4, similar to #cfcfcf)</li>
          <li>• Font Size: 12.5px (text-label from design tokens)</li>
          <li>• Font Weight: Medium (500) for labels, Normal (400) for secondary text</li>
          <li>• Divider Color: Neutral-500 (#737373, similar to #717171)</li>
          <li>• Gap between sections: 24px (gap-page)</li>
          <li>• Gap within sections: 12px (gap-3)</li>
          <li>• Icon Size: 15px (Settings, Logout, ChevronRight)</li>
          <li>• Hover State: white/5 opacity overlay</li>
          <li>• Interactive elements have hover states</li>
          <li>• Accessible with keyboard navigation</li>
        </ul>
      </div>

      {/* Component Props */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Component Props</h4>
        <div className="text-xs text-neutral-700 space-y-2">
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">userName: string</code>
            <p className="ml-4 text-neutral-600">User's display name</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">userEmail: string</code>
            <p className="ml-4 text-neutral-600">User's email address</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">userAvatar: string</code>
            <p className="ml-4 text-neutral-600">User's avatar URL</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">organizations?: Organization[]</code>
            <p className="ml-4 text-neutral-600">List of organizations (optional)</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">onSettingsClick?: () =&gt; void</code>
            <p className="ml-4 text-neutral-600">Callback for settings button</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">onLogoutClick?: () =&gt; void</code>
            <p className="ml-4 text-neutral-600">Callback for logout button</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">onOrganizationClick?: (org: Organization) =&gt; void</code>
            <p className="ml-4 text-neutral-600">Callback when organization is clicked</p>
          </div>
          <div>
            <code className="bg-neutral-200 px-1 py-0.5 rounded">className?: string</code>
            <p className="ml-4 text-neutral-600">Additional CSS classes</p>
          </div>
        </div>
      </div>

      {/* Organization Type */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Organization Type</h4>
        <pre className="text-xs text-neutral-700 overflow-x-auto">
{`interface Organization {
  id: string          // Unique identifier
  name: string        // Organization name
  avatarUrl: string   // Organization avatar URL
}`}
        </pre>
      </div>
    </div>
  )
}

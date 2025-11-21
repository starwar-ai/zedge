import React from 'react'
import { SettingsIcon, LogoutIcon, ChevronRightIcon } from '@/components/ui/Icons'

/**
 * User Profile Popup Component
 *
 * Figma reference: node-id=553-9362
 * Figma URL: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=553-9362
 *
 * A dark-themed popup menu displaying user information, settings, joined organizations, and logout option.
 */

export interface Organization {
  /**
   * Unique identifier for the organization
   */
  id: string

  /**
   * Organization name
   */
  name: string

  /**
   * Organization avatar URL
   */
  avatarUrl: string
}

export interface UserProfilePopupProps {
  /**
   * User's display name
   */
  userName: string

  /**
   * User's email address
   */
  userEmail: string

  /**
   * User's avatar URL
   */
  userAvatar: string

  /**
   * List of organizations the user has joined
   */
  organizations?: Organization[]

  /**
   * Callback when settings button is clicked
   */
  onSettingsClick?: () => void

  /**
   * Callback when logout button is clicked
   */
  onLogoutClick?: () => void

  /**
   * Callback when an organization is clicked
   */
  onOrganizationClick?: (organization: Organization) => void

  /**
   * Additional CSS class names
   */
  className?: string
}

/**
 * UserProfilePopup component matching Figma design
 *
 * Features:
 * - User avatar and information display
 * - Settings navigation with icon
 * - Organizations list with avatars
 * - Logout option
 * - Dark theme (#1e1e1e background)
 * - Responsive and accessible
 */
export const UserProfilePopup = React.forwardRef<HTMLDivElement, UserProfilePopupProps>(
  (
    {
      userName,
      userEmail,
      userAvatar,
      organizations = [],
      onSettingsClick,
      onLogoutClick,
      onOrganizationClick,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`bg-[#1e1e1e] rounded-card p-card ${className}`}
        data-name="UserProfilePopup"
        data-node-id="553:9362"
      >
        {/* Main Content Container */}
        <div className="flex flex-col items-center p-card gap-page">
          {/* User Avatar */}
          <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={userAvatar}
              alt={userName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center gap-1 w-full text-center">
            <div className="text-label font-medium text-white leading-[17.5px]">
              {userName}
            </div>
            <div className="text-label font-normal text-neutral-300 leading-[17.5px]">
              {userEmail}
            </div>
          </div>

          {/* Menu Items Container */}
          <div className="flex flex-col gap-3 w-full">
            {/* Settings Button */}
            <button
              onClick={onSettingsClick}
              className="flex items-center justify-between w-full group transition-colors hover:bg-white/5 rounded px-2 py-1.5 -mx-2"
            >
              <div className="flex items-center gap-2">
                <SettingsIcon size={15} color="white" />
                <span className="text-label font-medium text-white leading-[17.5px]">
                  设置
                </span>
              </div>
              <ChevronRightIcon size={15} color="white" />
            </button>

            {/* Divider */}
            <div className="h-px bg-neutral-500 w-full" />

            {/* Organizations Section */}
            {organizations.length > 0 && (
              <>
                {/* Organizations Label */}
                <div className="px-2">
                  <span className="text-label font-normal text-neutral-300 leading-[17.5px]">
                    已加入组织
                  </span>
                </div>

                {/* Organizations List */}
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => onOrganizationClick?.(org)}
                    className="flex items-center gap-3 w-full transition-colors hover:bg-white/5 rounded px-2 py-1.5 -mx-2"
                  >
                    <div className="w-[25px] h-[25px] rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={org.avatarUrl}
                        alt={org.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-label font-medium text-white leading-[17.5px]">
                      {org.name}
                    </span>
                  </button>
                ))}

                {/* Divider */}
                <div className="h-px bg-neutral-500 w-full" />
              </>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogoutClick}
              className="flex items-center justify-between w-full group transition-colors hover:bg-white/5 rounded px-2 py-1.5 -mx-2"
            >
              <div className="flex items-center gap-2">
                <LogoutIcon size={15} color="white" />
                <span className="text-label font-medium text-white leading-[17.5px]">
                  退出
                </span>
              </div>
              <ChevronRightIcon size={15} color="white" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

UserProfilePopup.displayName = 'UserProfilePopup'

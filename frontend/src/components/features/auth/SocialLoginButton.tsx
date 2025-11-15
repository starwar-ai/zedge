import React from 'react'

export interface SocialLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Social login provider name
   */
  provider: string

  /**
   * Icon to display - can be an image URL or a React component
   */
  icon: string | React.ReactNode

  /**
   * Callback when button is clicked
   */
  onLogin?: (provider: string) => void
}

/**
 * Social Login Button Component
 *
 * Figma reference: node-id=523-806 (Login page social buttons)
 *
 * Used for third-party authentication buttons (WeChat, QQ, Campus Network, etc.)
 *
 * @example
 * ```tsx
 * <SocialLoginButton
 *   provider="wechat"
 *   icon={wechatIcon}
 *   onLogin={(provider) => console.log(`Login with ${provider}`)}
 * >
 *   微信
 * </SocialLoginButton>
 * ```
 */
export const SocialLoginButton = React.forwardRef<
  HTMLButtonElement,
  SocialLoginButtonProps
>(({ provider, icon, onLogin, children, className = '', ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onLogin) {
      onLogin(provider)
    }
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={`
        bg-white border border-[#ececf0] rounded-[6.75px]
        p-1 h-[70px]
        flex flex-col items-center justify-center gap-2
        hover:bg-neutral-50 active:bg-neutral-100
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        {typeof icon === 'string' ? (
          <img src={icon} alt={provider} className="w-full h-full" />
        ) : (
          icon
        )}
      </div>
      <span className="font-['Inter'] font-medium text-[12.5px] leading-[20px] text-neutral-950">
        {children}
      </span>
    </button>
  )
})

SocialLoginButton.displayName = 'SocialLoginButton'

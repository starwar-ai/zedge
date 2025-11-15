import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialLoginButton, WeChatIcon, QQIcon, CampusIcon } from '@/components/features/auth'
import logoContainer from '@/assets/images/login/logo-container.png'

/**
 * Login Page Component
 *
 * Figma reference: node-id=523-806
 * Full-screen login page with split layout:
 * - Left: Decorative image section
 * - Right: Login form with email/password and social login options
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement actual login logic
    console.log('Login attempt:', { email, password })

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with ${provider}`)
    // TODO: Implement social login
  }

  return (
    <div className="bg-white flex flex-col h-screen w-full p-2" data-name="LoginPage">
      {/* Logo Section */}
      <div className="flex flex-col gap-2 p-2 shrink-0 w-full">
        <div className="flex gap-[10.5px] h-[38px] items-center">
          <div className="relative rounded-[8.75px] size-[28px] overflow-hidden">
            <img
              alt="DeskPro Logo"
              className="absolute inset-0 w-full h-full object-cover rounded-[8.75px]"
              src={logoContainer}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-['Inter'] font-medium text-[14px] leading-[21px] text-neutral-950 tracking-[-0.1504px]">
              DeskPro
            </h1>
            <p className="font-['Inter'] font-normal text-[12.25px] leading-[17.5px] text-[#717182] tracking-[-0.0179px]">
              One Link Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-2 min-h-0 overflow-hidden p-2">
        {/* Image Container - Left Side */}
        <div className="flex-1  relative overflow-hidden hidden lg:block">
        </div>

        {/* Login Section - Right Side */}
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="bg-white border border-[#ececf0] rounded-[5px] p-3 w-full max-w-[452px]">
            {/* Card Header */}
            <div className="px-6 pt-3 pb-0">
              <h2 className="font-['Inter'] font-normal text-[18px] leading-[24px] text-neutral-950 h-[31.5px]">
                欢迎回来
              </h2>
              <p className="font-['Inter'] font-normal text-[12.5px] leading-[21px] text-[#717182] h-[31.5px]">
                请输入您的账户信息以登录
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="px-6 py-0">
              <div className="space-y-2">
                {/* Email Input */}
                <Input
                  type="email"
                  size="md"
                  label="邮箱"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2 h-[24px]">
                    <label className="block text-[12.5px] font-medium text-neutral-950 leading-[14px]">
                      密码
                    </label>
                    <button
                      type="button"
                      className="text-[12.5px] font-normal text-[#717182] hover:text-neutral-950 transition-colors leading-[24px]"
                      onClick={() => console.log('Forgot password')}
                    >
                      忘记密码？
                    </button>
                  </div>
                  <Input
                    type="password"
                    size="md"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                  />
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  loading={loading}
                  className="h-[28px] rounded-[6.75px] text-[12.5px] font-medium tracking-[1px] leading-[17.5px]"
                >
                  登录
                </Button>
              </div>

              {/* Divider */}
              <div className="relative h-[24px] mt-2">
                <div className="absolute border-t border-[#ececf0] top-[11.5px] w-full" />
                <div className="absolute bg-white left-1/2 -translate-x-1/2 px-2">
                  <p className="font-['Inter'] font-normal text-[12.5px] leading-[24px] text-[#717182]">
                    或使用第三方登录
                  </p>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-3 items-center w-full">
                <SocialLoginButton provider="wechat" icon={<WeChatIcon />} onLogin={handleSocialLogin} className="flex-1">
                  微信
                </SocialLoginButton>

                <SocialLoginButton provider="qq" icon={<QQIcon />} onLogin={handleSocialLogin} className="flex-1">
                  QQ
                </SocialLoginButton>

                <SocialLoginButton provider="campus" icon={<CampusIcon />} onLogin={handleSocialLogin} className="flex-1">
                  校园网
                </SocialLoginButton>
              </div>

              {/* Register Link */}
              <div className="text-center mt-2">
                <span className="font-['Inter'] font-normal text-[12.5px] leading-[21px] text-[#717182]">
                  还没有账户
                </span>
                <span className="font-['Inter'] font-normal text-[14px] leading-[21px] text-[#717182]">
                  ？
                </span>
                <button
                  type="button"
                  className="font-['Inter'] font-normal text-[12.5px] leading-[18.75px] text-neutral-950 ml-1 hover:underline"
                  onClick={() => console.log('Navigate to register')}
                >
                  立即注册
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center p-2 shrink-0">
        <p className="font-['Inter'] font-normal text-[12px] text-black">
          @all rights reserved
        </p>
      </div>
    </div>
  )
}

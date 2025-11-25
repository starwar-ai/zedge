import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialLoginButton, WeChatIcon, QQIcon, CampusIcon } from '@/components/features/auth'
import { ControlledForm, FormField, FormInputField } from '@/components/form'
import { useFormSubmit } from '@/hooks/useFormHelpers'
import logoContainer from '@/assets/images/logo-container.png'

const loginSchema = z.object({
  email: z
    .string({ required_error: '请输入邮箱' })
    .min(1, '请输入邮箱')
    .email('请输入合法邮箱'),
  password: z
    .string({ required_error: '请输入密码' })
    .min(6, '密码至少 6 位'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Login Page Component
 *
 * Figma reference: node-id=523-806
 * Full-screen login page with split layout:
 * - Left: Decorative image section
 * - Right: Login form with email/password and social login options
 */
export default function LoginPage() {
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginHandler = useCallback(async (values: LoginFormValues) => {
    // TODO: Implement actual login logic with API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Login payload', values)
  }, [])

  const { submitting, onSubmit } = useFormSubmit(methods, loginHandler)

  const handleSocialLogin = (_provider: string) => {
    // TODO: Implement social login
  }

  return (
    <div className="bg-surface-primary flex flex-col h-screen w-full p-page" data-name="LoginPage">
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
            <h1 className="font-['Inter'] font-medium text-button-medium leading-[21px] text-text-primary tracking-text-tight">
              DeskPro
            </h1>
            <p className="font-['Inter'] font-normal text-[12.25px] leading-[17.5px] text-text-secondary tracking-button-default">
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
        <div className="flex-1 flex items-center justify-center p-page">
          <div className="bg-surface-primary border border-default rounded-[5px] p-card w-full max-w-[452px]">
            {/* Card Header */}
            <div className="px-6 pt-3 pb-0">
              <h2 className="font-['Inter'] font-normal text-heading-h3 leading-[24px] text-text-primary h-[31.5px]">
                欢迎回来
              </h2>
              <p className="font-['Inter'] font-normal text-text leading-[21px] text-text-secondary h-[31.5px]">
                请输入您的账户信息以登录
              </p>
            </div>

            {/* Login Form */}
            <ControlledForm methods={methods} onSubmit={onSubmit} className="px-6 py-0">
              <div className="space-y-2">
                {/* Email Input */}
                <FormInputField
                  name="email"
                  type="email"
                  size="md"
                  label="邮箱"
                  placeholder="请输入邮箱"
                  fullWidth
                />

                {/* Password Input */}
                <FormField
                  name="password"
                  render={({ field, fieldState }) => (
                    <div>
                      <div className="flex items-center justify-between mb-2 h-[24px]">
                        <label className="block text-label font-medium text-text-primary leading-[14px]">
                          密码
                        </label>
                        <button
                          type="button"
                          className="text-text font-normal text-text-secondary hover:text-text-primary transition-colors leading-[24px]"
                          onClick={() => {
                            // TODO: Navigate to forgot password page
                          }}
                        >
                          忘记密码？
                        </button>
                      </div>
                      <Input
                        type="password"
                        size="md"
                        placeholder="请输入密码"
                        fullWidth
                        {...field}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                      />
                    </div>
                  )}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  loading={submitting}
                  className="h-[28px] rounded-[6.75px] text-[12.5px] font-medium tracking-[1px] leading-[17.5px]"
                >
                  登录
                </Button>
              </div>

              {/* Divider */}
              <div className="relative h-[24px] mt-2">
                <div className="absolute border-t border-default top-[11.5px] w-full" />
                <div className="absolute bg-surface-primary left-1/2 -translate-x-1/2 px-2">
                  <p className="font-['Inter'] font-normal text-text leading-[24px] text-text-secondary">
                    或使用第三方登录
                  </p>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-button-group-default items-center w-full">
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
                <span className="font-['Inter'] font-normal text-text leading-[21px] text-text-secondary">
                  还没有账户
                </span>
                <span className="font-['Inter'] font-normal text-text leading-[21px] text-text-secondary">
                  ？
                </span>
                <button
                  type="button"
                  className="font-['Inter'] font-normal text-text leading-[18.75px] text-text-primary ml-1 hover:underline"
                  onClick={() => {
                    // TODO: Navigate to register page
                  }}
                >
                  立即注册
                </button>
              </div>
            </ControlledForm>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center p-page shrink-0">
        <p className="font-['Inter'] font-normal text-button-small text-text-primary">
          @all rights reserved
        </p>
      </div>
    </div>
  )
}

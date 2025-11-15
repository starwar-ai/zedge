import React from 'react'

/**
 * WeChat Icon Component
 * Chat bubble icon for WeChat social login
 */
export const WeChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M1.99466 10.8947C2.09269 11.1419 2.11451 11.4129 2.05733 11.6727L1.34733 13.866C1.32445 13.9772 1.33037 14.0925 1.36451 14.2008C1.39866 14.3091 1.45991 14.4069 1.54244 14.4848C1.62498 14.5628 1.72607 14.6185 1.83613 14.6464C1.94619 14.6744 2.06157 14.6738 2.17133 14.6447L4.44666 13.9793C4.69181 13.9307 4.94568 13.952 5.17933 14.0407C6.60292 14.7055 8.21558 14.8461 9.73276 14.4378C11.25 14.0295 12.5742 13.0984 13.4718 11.8089C14.3694 10.5194 14.7827 8.95427 14.6389 7.3897C14.495 5.82513 13.8031 4.36165 12.6854 3.25746C11.5676 2.15328 10.0958 1.47936 8.52959 1.3546C6.96337 1.22984 5.40342 1.66225 4.12496 2.57556C2.8465 3.48886 1.93168 4.82436 1.54193 6.34642C1.15217 7.86849 1.31251 9.4793 1.99466 10.8947Z"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * QQ Icon Component
 * Same as WeChat icon (placeholder)
 */
export const QQIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <WeChatIcon {...props} />
)

/**
 * Campus Network Icon Component
 * Building/institution icon for campus network login
 */
export const CampusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.33333 14V12C9.33333 11.6464 9.19286 11.3072 8.94281 11.0572C8.69276 10.8071 8.35362 10.6667 8 10.6667C7.64638 10.6667 7.30724 10.8071 7.05719 11.0572C6.80714 11.3072 6.66667 11.6464 6.66667 12V14"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3.33333V14"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.66667 3.99999L7.404 1.47332C7.58907 1.38085 7.79311 1.3327 8 1.3327C8.20689 1.3327 8.41093 1.38085 8.596 1.47332L13.3333 3.99999"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 7.33333L1.65333 8.76467C1.55564 8.82414 1.47488 8.90776 1.41884 9.00746C1.3628 9.10717 1.33335 9.21962 1.33333 9.334V12.6667C1.33333 13.0203 1.47381 13.3594 1.72386 13.6095C1.97391 13.8595 2.31304 14 2.66667 14H13.3333C13.687 14 14.0261 13.8595 14.2761 13.6095C14.5262 13.3594 14.6667 13.0203 14.6667 12.6667V9.33333C14.6665 9.21907 14.637 9.10676 14.581 9.00717C14.525 8.90759 14.4443 8.82408 14.3467 8.76467L12 7.33333"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 3.33333V14"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 7.33333C8.73638 7.33333 9.33333 6.73638 9.33333 6C9.33333 5.26362 8.73638 4.66667 8 4.66667C7.26362 4.66667 6.66667 5.26362 6.66667 6C6.66667 6.73638 7.26362 7.33333 8 7.33333Z"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

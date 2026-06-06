import { logout } from '../../lib/auth'

interface Props {
  className?: string
}

export default function LogoutButton({ className = 'cnr-btn-draft' }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.confirm('Sign out of your account?')) {
          logout()
        }
      }}
    >
      Log Out
    </button>
  )
}

"use client"

import { LogOut, Settings, UserRoundCog } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthContext } from "@/contexts/auth-context"
import { toast } from "react-hot-toast" // or your toast library
import { apiClient } from "@/lib/api-client"
import { removeAuthToken } from "@/lib/auth"

interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

interface UserProfileProps {
  name: string
  role: string
  avatar: string
}

export default function UserProfile({
  name,
  role,
  avatar,
}: Partial<UserProfileProps>) {
  const auth = useContext(AuthContext)
  const router = useRouter()

  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      href: "#",
      icon: <UserRoundCog className="size-5" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="size-5" />,
    },
  ]

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...")

    try {
      const response = await apiClient.logout<{ message: string }>('/logout')

      // Always remove loading
      toast.dismiss(loadingToast)

      if (response.error) {
        toast.error(response.error || 'Logout failed')
        return
      }

      removeAuthToken()

      if (auth?.logout) {
        auth.logout()
      }

      toast.success(response.data?.message || 'Logged out successfully')

      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)

      // Remove loading toast before showing error
      toast.dismiss(loadingToast)

      toast.error('An error occurred during logout')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-6 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image
                src={avatar ?? ""}
                alt="Name"
                width={72}
                height={72}
                className="rounded-full ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{role}</p>
            </div>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-zinc-100 dark:hover:bg-zinc-800/50 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-base text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                </div>
              </Link>
            ))}

            <Button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer bg-white shadow-none flex items-center justify-between p-2 
                                hover:bg-zinc-100 dark:hover:bg-zinc-800/100 
                                rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <LogOut className="size-5 text-black" />
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
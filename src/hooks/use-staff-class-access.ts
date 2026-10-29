import { useEffect, useState } from "react"
import axiosInstance from "@/services/api"

type AccessState = boolean | null

const accessByUser = new Map<string, AccessState>()
const pendingByUser = new Map<string, Promise<boolean>>()

/** Resolve class-teacher navigation access once per signed-in user per app session. */
export function useStaffClassAccess(userId?: string, isStaff = false): AccessState {
  const [accessState, setAccessState] = useState<{ userId?: string; allowed: AccessState }>(() =>
    ({ userId, allowed: isStaff && userId ? accessByUser.get(userId) ?? null : false }),
  )

  useEffect(() => {
    if (!isStaff || !userId) {
      setAccessState({ userId, allowed: false })
      return
    }

    const cached = accessByUser.get(userId)
    if (cached !== undefined) {
      setAccessState({ userId, allowed: cached })
      return
    }

    let active = true
    let request = pendingByUser.get(userId)
    if (!request) {
      request = axiosInstance.get("/result-approval/can-approve-results")
        .then(({ data }) => Boolean(data?.canApprove ?? false))
        .catch(() => false)
        .then((allowed) => {
          accessByUser.set(userId, allowed)
          pendingByUser.delete(userId)
          return allowed
        })
      pendingByUser.set(userId, request)
    }

    request.then((allowed) => {
      if (active) setAccessState({ userId, allowed })
    })

    return () => {
      active = false
    }
  }, [isStaff, userId])

  if (!isStaff || !userId) return false
  return accessState.userId === userId
    ? accessState.allowed
    : accessByUser.get(userId) ?? null
}

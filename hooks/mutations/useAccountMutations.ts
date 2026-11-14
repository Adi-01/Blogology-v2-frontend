"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePasswordAction,
  revokeSessionAction,
  deleteAccountAction,
} from "@/app/actions/user";
import { logoutAction } from "@/app/actions/auth";
import { useUser } from "@/components/providers/user-provider";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useChangePasswordMutation() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => changePasswordAction(null, formData),
    onSuccess: (res) => {
      if (res.success && user) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions(user.id) });
      }
    },
  });
}

export function useRevokeSessionMutation() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      isCurrent,
    }: {
      sessionId: string;
      isCurrent: boolean;
    }) => revokeSessionAction(sessionId, isCurrent),
    onSuccess: (res, variables) => {
      if (res.success && !variables.isCurrent && user) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions(user.id) });
      }
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => deleteAccountAction(null, formData),
    onSuccess: (res) => {
      if (res?.success) {
        queryClient.clear();
      }
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      queryClient.clear();
      await logoutAction();
    },
  });
}

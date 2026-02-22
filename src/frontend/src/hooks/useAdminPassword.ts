import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useChangePassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }: ChangePasswordParams) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Validate password length
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call backend password change method
      // Note: This requires backend implementation of changePassword
      // For now, this will throw an error until backend is implemented
      if (typeof (actor as any).changePassword !== 'function') {
        throw new Error('Password change functionality not yet implemented in backend');
      }

      const result = await (actor as any).changePassword(currentPassword, newPassword);
      
      if (!result) {
        throw new Error('Current password is incorrect');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

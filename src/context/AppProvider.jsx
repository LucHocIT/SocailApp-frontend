import { AuthProvider } from './auth/AuthContext';
import { ProfileProvider } from './profile/ProfileContext';
import { SocialProvider } from './social/SocialContext';

// Root Provider kết hợp tất cả context khác
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <SocialProvider>
            {children}
        </SocialProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

import { AuthProvider } from './auth/AuthContext';
import { ProfileProvider } from './profile/ProfileContext';
import { SocialProvider } from './social/SocialContext';
import { ChatProvider } from './chat/ChatContext';

// Root Provider kết hợp tất cả context khác
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <SocialProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SocialProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

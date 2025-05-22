import React from 'react';
import { mount } from 'enzyme';
import LoginModal from '../components/auth/LoginModal';
import { AuthProvider } from '../context/auth/AuthContext';
import { act } from 'react-dom/test-utils';
import authService from '../services/authService';

// Mock authService
jest.mock('../services/authService');

describe('LoginModal', () => {
  let wrapper;
  const mockOnClose = jest.fn();
  const mockSwitchToRegister = jest.fn();
  const mockSwitchToForgotPassword = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    wrapper = mount(
      <AuthProvider>
        <LoginModal
          onClose={mockOnClose}
          onSwitchToRegister={mockSwitchToRegister}
          onSwitchToForgotPassword={mockSwitchToForgotPassword}
        />
      </AuthProvider>
    );
  });
  
  it('should display error message and keep modal open when login fails', async () => {
    // Setup mock to throw error
    authService.login.mockImplementation(() => {
      throw new Error('Incorrect username or password');
    });
    
    // Fill in login form
    wrapper.find('input[name="username"]').simulate('change', {
      target: { name: 'username', value: 'testuser' },
    });
    
    wrapper.find('input[name="password"]').simulate('change', {
      target: { name: 'password', value: 'wrongpassword' },
    });
    
    // Submit the form
    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    
    // Assert error is displayed
    expect(wrapper.find('.loginError').exists()).toBe(true);
    expect(wrapper.find('.loginError').text()).toContain('Incorrect username or password');
    
    // Assert modal was not closed
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('should close modal when login is successful', async () => {
    // Setup mock to return success
    authService.login.mockResolvedValue({ 
      user: { id: 1, username: 'testuser' },
      token: 'fake-token'
    });
    
    // Fill in login form
    wrapper.find('input[name="username"]').simulate('change', {
      target: { name: 'username', value: 'testuser' },
    });
    
    wrapper.find('input[name="password"]').simulate('change', {
      target: { name: 'password', value: 'correctpassword' },
    });
    
    // Submit the form
    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    
    // Assert modal was closed
    expect(mockOnClose).toHaveBeenCalled();
  });
});

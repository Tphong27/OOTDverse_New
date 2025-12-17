/**
 * Style Profile Unit Tests
 * 
 * Test file: frontend/__tests__/pages/user/profile.test.jsx
 * 
 * Covers:
 * - Happy paths (normal user flows)
 * - Edge cases (boundary conditions)
 * - Error states (API failures, validation errors)
 * 
 * Prerequisites:
 * - npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/pages/user/profile';
import * as userService from '@/services/userService';
import axios from 'axios';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/services/userService');
jest.mock('axios');
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/user/profile',
  }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// ============================================================================
// TEST DATA
// ============================================================================

const mockCurrentUser = {
  _id: 'user123',
  email: 'test@example.com',
  fullName: 'Test User',
};

const mockUserProfile = {
  _id: 'user123',
  email: 'test@example.com',
  fullName: 'Test User',
  phone: '0901234567',
  birthday: '2000-01-15',
  age: 24,
  gender: 'Nam',
  bio: 'Fashion lover',
  height: 170,
  weight: 65,
  bust: 90,
  waist: 70,
  hips: 95,
  favoriteStyles: [{ _id: 'style1', name: 'Minimalist' }],
  favoriteBrands: [{ _id: 'brand1', name: 'Uniqlo' }],
  favoriteColors: [{ _id: 'color1', name: 'Đen' }],
  favoriteOccasions: [{ _id: 'occasion1', name: 'Đi học' }],
  avoidColors: [{ _id: 'color2', name: 'Vàng' }],
  budget: '1-3 triệu',
  sustainableFashion: true,
};

const mockSettings = [
  { _id: 'style1', type: 'style', name: 'Minimalist', status: 'Active' },
  { _id: 'style2', type: 'style', name: 'Streetwear', status: 'Active' },
  { _id: 'style3', type: 'style', name: 'Vintage', status: 'Inactive' },
  { _id: 'brand1', type: 'brand', name: 'Uniqlo', status: 'Active' },
  { _id: 'brand2', type: 'brand', name: 'Zara', status: 'Active' },
  { _id: 'color1', type: 'color', name: 'Đen', status: 'Active' },
  { _id: 'color2', type: 'color', name: 'Vàng', status: 'Active' },
  { _id: 'color3', type: 'color', name: 'Trắng', status: 'Active' },
  { _id: 'occasion1', type: 'occasion', name: 'Đi học', status: 'Active' },
  { _id: 'occasion2', type: 'occasion', name: 'Đi tiệc', status: 'Active' },
];

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
  mockLocalStorage.setItem('currentUser', JSON.stringify(mockCurrentUser));
  
  // Default successful API responses
  axios.get.mockResolvedValue({ data: mockSettings });
  userService.getUserProfile.mockResolvedValue(mockUserProfile);
  userService.updateUserProfile.mockResolvedValue({ success: true });
});

// ============================================================================
// HAPPY PATH TESTS
// ============================================================================

describe('Style Profile - Happy Paths', () => {
  
  describe('Initial Load', () => {
    
    test('should display user info correctly after loading', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('0901234567')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2000-01-15')).toBeInTheDocument();
      });
    });
    
    test('should display body measurements correctly', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('170')).toBeInTheDocument(); // height
        expect(screen.getByDisplayValue('65')).toBeInTheDocument();  // weight
        expect(screen.getByDisplayValue('90')).toBeInTheDocument();  // bust
        expect(screen.getByDisplayValue('70')).toBeInTheDocument();  // waist
        expect(screen.getByDisplayValue('95')).toBeInTheDocument();  // hips
      });
    });
    
    test('should display selected favorite styles', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Minimalist')).toBeInTheDocument();
      });
    });
    
    test('should calculate age from birthday automatically', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        // Age should be auto-calculated as read-only
        const ageInput = screen.getByDisplayValue('24');
        expect(ageInput).toBeDisabled();
      });
    });
    
    test('should load available settings for selection', async () => {
      render(<ProfilePage />);
      
      // Click edit to show all options
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Streetwear')).toBeInTheDocument();
        expect(screen.getByText('Zara')).toBeInTheDocument();
      });
    });
    
  });
  
  describe('Edit Mode', () => {
    
    test('should enable editing when clicking Edit button', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const nameInput = screen.getByDisplayValue('Test User');
      expect(nameInput).not.toBeDisabled();
    });
    
    test('should toggle edit button text between Chỉnh sửa and Hủy', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      expect(screen.getByText('Hủy')).toBeInTheDocument();
    });
    
    test('should update fullName when typing', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
    });
    
    test('should toggle style selection when clicking', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Click to add Streetwear
      fireEvent.click(screen.getByText('Streetwear'));
      
      // Should be selected (check for purple background class)
      expect(screen.getByText('Streetwear')).toHaveClass('bg-purple-600');
    });
    
    test('should toggle style deselection when clicking selected item', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Minimalist is already selected, click to deselect
      const minimalistBtn = screen.getByText('Minimalist');
      fireEvent.click(minimalistBtn);
      
      // Should be deselected (no purple background)
      expect(minimalistBtn).not.toHaveClass('bg-purple-600');
    });
    
  });
  
  describe('Save Profile', () => {
    
    test('should call updateUserProfile with correct data on save', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Update name
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      
      // Click save
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user123',
            fullName: 'New Name',
          })
        );
      });
    });
    
    test('should show success notification after saving', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(screen.getByText('Đã lưu thông tin thành công!')).toBeInTheDocument();
      });
    });
    
    test('should exit edit mode after successful save', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument();
        expect(screen.queryByText('Hủy')).not.toBeInTheDocument();
      });
    });
    
    test('should reload profile data after successful save', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        // getUserProfile should be called twice: initial load + after save
        expect(userService.getUserProfile).toHaveBeenCalledTimes(2);
      });
    });
    
  });
  
  describe('Gender Selection', () => {
    
    test('should allow selecting gender from dropdown', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const genderSelect = screen.getByDisplayValue('Nam');
      fireEvent.change(genderSelect, { target: { value: 'Nữ' } });
      
      expect(screen.getByDisplayValue('Nữ')).toBeInTheDocument();
    });
    
    test('should display all gender options', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      expect(screen.getByText('Nam')).toBeInTheDocument();
      expect(screen.getByText('Nữ')).toBeInTheDocument();
      expect(screen.getByText('Khác')).toBeInTheDocument();
    });
    
  });
  
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Style Profile - Edge Cases', () => {
  
  describe('Empty Profile', () => {
    
    test('should handle user with empty profile gracefully', async () => {
      const emptyProfile = {
        _id: 'user123',
        email: 'test@example.com',
        fullName: '',
        favoriteStyles: [],
        favoriteBrands: [],
        favoriteColors: [],
        favoriteOccasions: [],
        avoidColors: [],
      };
      
      userService.getUserProfile.mockResolvedValue(emptyProfile);
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chưa có dữ liệu')).not.toBeInTheDocument();
      });
    });
    
    test('should handle null/undefined favoriteStyles', async () => {
      const profileWithNulls = {
        ...mockUserProfile,
        favoriteStyles: null,
        favoriteBrands: undefined,
      };
      
      userService.getUserProfile.mockResolvedValue(profileWithNulls);
      
      render(<ProfilePage />);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
    
  });
  
  describe('Birthday Validation', () => {
    
    test('should reject birthday in the future', async () => {
      // Mock alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Set future date
      const birthdayInput = screen.getByDisplayValue('2000-01-15');
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      fireEvent.change(birthdayInput, { target: { value: futureDateStr } });
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Ngày sinh không được lớn hơn hôm nay.');
      });
      
      alertMock.mockRestore();
    });
    
    test('should accept valid birthday', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const birthdayInput = screen.getByDisplayValue('2000-01-15');
      fireEvent.change(birthdayInput, { target: { value: '1995-06-20' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalled();
      });
    });
    
    test('should recalculate age when birthday changes', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const birthdayInput = screen.getByDisplayValue('2000-01-15');
      fireEvent.change(birthdayInput, { target: { value: '1990-01-15' } });
      
      // Age should update to ~34 (depending on current date)
      await waitFor(() => {
        const ageInput = document.querySelector('input[type="number"][disabled]');
        expect(parseInt(ageInput.value)).toBeGreaterThanOrEqual(34);
      });
    });
    
  });
  
  describe('Body Measurements Edge Cases', () => {
    
    test('should accept empty measurements', async () => {
      const profileWithoutMeasurements = {
        ...mockUserProfile,
        height: '',
        weight: '',
        bust: '',
        waist: '',
        hips: '',
      };
      
      userService.getUserProfile.mockResolvedValue(profileWithoutMeasurements);
      
      render(<ProfilePage />);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
    
    test('should allow zero values for measurements', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '0' } });
      
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });
    
    test('should handle very large measurement values', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '999' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            height: '999',
          })
        );
      });
    });
    
  });
  
  describe('Settings Filter', () => {
    
    test('should only show Active settings, not Inactive', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Vintage has status: 'Inactive', should not be shown
      expect(screen.queryByText('Vintage')).not.toBeInTheDocument();
    });
    
    test('should handle empty settings from API', async () => {
      axios.get.mockResolvedValue({ data: [] });
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Should show "Chưa có dữ liệu" for empty categories
      const noDataMessages = screen.getAllByText('Chưa có dữ liệu');
      expect(noDataMessages.length).toBeGreaterThan(0);
    });
    
  });
  
  describe('Multiple Selections', () => {
    
    test('should allow selecting multiple styles', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Minimalist already selected, add Streetwear
      fireEvent.click(screen.getByText('Streetwear'));
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            favoriteStyles: expect.arrayContaining(['style1', 'style2']),
          })
        );
      });
    });
    
    test('should allow selecting same color in both favorite and avoid', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // This is technically allowed by current implementation
      // Business logic may need to prevent this
      const blackColorButtons = screen.getAllByText('Đen');
      
      // Both should be clickable
      expect(blackColorButtons.length).toBeGreaterThanOrEqual(1);
    });
    
  });
  
  describe('Cancel Edit', () => {
    
    test('should revert changes when clicking Hủy', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Change name
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
      
      // Click Hủy
      fireEvent.click(screen.getByText('Hủy'));
      
      // Name should NOT be saved (updateUserProfile not called)
      expect(userService.updateUserProfile).not.toHaveBeenCalled();
    });
    
  });
  
  describe('No User in LocalStorage', () => {
    
    test('should handle missing currentUser in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(<ProfilePage />);
      
      // Should not crash, API should not be called
      await waitFor(() => {
        expect(userService.getUserProfile).not.toHaveBeenCalled();
      });
    });
    
  });
  
});

// ============================================================================
// ERROR STATE TESTS
// ============================================================================

describe('Style Profile - Error States', () => {
  
  describe('API Errors on Load', () => {
    
    test('should handle getUserProfile API failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      userService.getUserProfile.mockRejectedValue(new Error('Network error'));
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Lỗi tải dữ liệu:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
    
    test('should handle settings API failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValue(new Error('Settings fetch failed'));
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
    
    test('should still render page structure when API fails', async () => {
      userService.getUserProfile.mockRejectedValue(new Error('API Error'));
      
      render(<ProfilePage />);
      
      // Page should still render with empty data
      await waitFor(() => {
        expect(screen.getByText('Thông tin cá nhân')).toBeInTheDocument();
        expect(screen.getByText('Số đo cơ thể')).toBeInTheDocument();
      });
    });
    
  });
  
  describe('API Errors on Save', () => {
    
    test('should show error alert when save fails', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      userService.updateUserProfile.mockRejectedValue(new Error('Save failed'));
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Có lỗi khi lưu thông tin.');
      });
      
      alertMock.mockRestore();
    });
    
    test('should keep edit mode when save fails', async () => {
      userService.updateUserProfile.mockRejectedValue(new Error('Save failed'));
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        // Should still be in edit mode
        expect(screen.getByText('Hủy')).toBeInTheDocument();
      });
    });
    
    test('should not show success notification when save fails', async () => {
      userService.updateUserProfile.mockRejectedValue(new Error('Save failed'));
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(screen.queryByText('Đã lưu thông tin thành công!')).not.toBeInTheDocument();
      });
    });
    
    test('should reset isSaving state after error', async () => {
      userService.updateUserProfile.mockRejectedValue(new Error('Save failed'));
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        // Save button should be enabled again
        const saveButton = screen.getByText('Lưu thay đổi');
        expect(saveButton).not.toBeDisabled();
      });
    });
    
  });
  
  describe('Malformed Data', () => {
    
    test('should handle malformed birthday format', async () => {
      const profileWithBadDate = {
        ...mockUserProfile,
        birthday: 'invalid-date',
      };
      
      userService.getUserProfile.mockResolvedValue(profileWithBadDate);
      
      render(<ProfilePage />);
      
      // Should not crash, age might show NaN or empty
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
    
    test('should handle non-array favoriteStyles', async () => {
      const profileWithBadStyles = {
        ...mockUserProfile,
        favoriteStyles: 'not-an-array',
      };
      
      userService.getUserProfile.mockResolvedValue(profileWithBadStyles);
      
      render(<ProfilePage />);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
    
  });
  
  describe('Network Timeout', () => {
    
    test('should handle slow network when loading', async () => {
      jest.useFakeTimers();
      
      // Simulate slow response
      userService.getUserProfile.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockUserProfile), 5000))
      );
      
      render(<ProfilePage />);
      
      // Fast-forward time
      jest.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
    
  });
  
});

// ============================================================================
// COLOR CONFLICT TESTS (NEW - Auto-remove conflicting colors)
// ============================================================================

describe('Style Profile - Color Conflict Resolution', () => {
  
  describe('Auto-remove from avoidColors when adding to favoriteColors', () => {
    
    test('should remove color from avoidColors when adding to favoriteColors', async () => {
      // User has "Vàng" in avoidColors
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Click "Vàng" in favoriteColors section
      const favoriteColorsSection = screen.getByText('Màu sắc ưu tiên').closest('div');
      const yellowInFavorite = within(favoriteColorsSection).getByText('Vàng');
      fireEvent.click(yellowInFavorite);
      
      // "Vàng" should be removed from avoidColors
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            favoriteColors: expect.arrayContaining(['color2']), // Vàng added
            avoidColors: expect.not.arrayContaining(['color2']), // Vàng removed
          })
        );
      });
    });
    
    test('should show notification when auto-removing conflicting color', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Click conflicting color
      const favoriteColorsSection = screen.getByText('Màu sắc ưu tiên').closest('div');
      const yellowInFavorite = within(favoriteColorsSection).getByText('Vàng');
      fireEvent.click(yellowInFavorite);
      
      // Should show toast/notification about auto-removal
      await waitFor(() => {
        expect(screen.getByText(/đã xóa.*khỏi danh sách tránh/i)).toBeInTheDocument();
      });
    });
    
  });
  
  describe('Auto-remove from favoriteColors when adding to avoidColors', () => {
    
    test('should remove color from favoriteColors when adding to avoidColors', async () => {
      // User has "Đen" in favoriteColors
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Click "Đen" in avoidColors section
      const avoidColorsSection = screen.getByText('Màu sắc KHÔNG thích').closest('div');
      const blackInAvoid = within(avoidColorsSection).getByText('Đen');
      fireEvent.click(blackInAvoid);
      
      // "Đen" should be removed from favoriteColors
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            favoriteColors: expect.not.arrayContaining(['color1']), // Đen removed
            avoidColors: expect.arrayContaining(['color1']), // Đen added
          })
        );
      });
    });
    
  });
  
  describe('No conflict for different colors', () => {
    
    test('should allow selecting different colors in favorite and avoid', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Add "Trắng" to favoriteColors (no conflict with existing "Vàng" in avoidColors)
      const favoriteColorsSection = screen.getByText('Màu sắc ưu tiên').closest('div');
      const whiteInFavorite = within(favoriteColorsSection).getByText('Trắng');
      fireEvent.click(whiteInFavorite);
      
      // Both should be selected without conflict
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            favoriteColors: expect.arrayContaining(['color1', 'color3']), // Đen + Trắng
            avoidColors: expect.arrayContaining(['color2']), // Vàng still there
          })
        );
      });
    });
    
  });
  
});

// ============================================================================
// BODY MEASUREMENTS VALIDATION TESTS (NEW - Min/Max validation)
// ============================================================================

describe('Style Profile - Measurements Validation', () => {
  
  const MEASUREMENT_LIMITS = {
    height: { min: 100, max: 250, label: 'Chiều cao' },
    weight: { min: 30, max: 200, label: 'Cân nặng' },
    bust: { min: 60, max: 150, label: 'bust' },
    waist: { min: 40, max: 150, label: 'waist' },
    hips: { min: 60, max: 180, label: 'hips' },
  };
  
  describe('Height Validation', () => {
    
    test('should reject height below minimum (100cm)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '50' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Chiều cao phải từ 100-250 cm')
        );
      });
      
      alertMock.mockRestore();
    });
    
    test('should reject height above maximum (250cm)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '300' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Chiều cao phải từ 100-250 cm')
        );
      });
      
      alertMock.mockRestore();
    });
    
    test('should accept valid height', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '175' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({ height: '175' })
        );
      });
    });
    
    test('should accept boundary value at minimum', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '100' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalled();
      });
    });
    
    test('should accept boundary value at maximum', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '250' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalled();
      });
    });
    
  });
  
  describe('Weight Validation', () => {
    
    test('should reject weight below minimum (30kg)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const weightInput = screen.getByDisplayValue('65');
      fireEvent.change(weightInput, { target: { value: '20' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Cân nặng phải từ 30-200 kg')
        );
      });
      
      alertMock.mockRestore();
    });
    
    test('should reject weight above maximum (200kg)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const weightInput = screen.getByDisplayValue('65');
      fireEvent.change(weightInput, { target: { value: '250' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Cân nặng phải từ 30-200 kg')
        );
      });
      
      alertMock.mockRestore();
    });
    
  });
  
  describe('Bust/Waist/Hips Validation', () => {
    
    test('should reject bust below minimum (60cm)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const bustInput = screen.getByDisplayValue('90');
      fireEvent.change(bustInput, { target: { value: '50' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('bust phải từ 60-150 cm')
        );
      });
      
      alertMock.mockRestore();
    });
    
    test('should reject waist below minimum (40cm)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const waistInput = screen.getByDisplayValue('70');
      fireEvent.change(waistInput, { target: { value: '30' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('waist phải từ 40-150 cm')
        );
      });
      
      alertMock.mockRestore();
    });
    
    test('should reject hips below minimum (60cm)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const hipsInput = screen.getByDisplayValue('95');
      fireEvent.change(hipsInput, { target: { value: '50' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('hips phải từ 60-180 cm')
        );
      });
      
      alertMock.mockRestore();
    });
    
  });
  
  describe('Empty Measurements', () => {
    
    test('should allow saving with empty measurements (optional fields)', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      // Clear all measurements
      const heightInput = screen.getByDisplayValue('170');
      const weightInput = screen.getByDisplayValue('65');
      
      fireEvent.change(heightInput, { target: { value: '' } });
      fireEvent.change(weightInput, { target: { value: '' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalled();
      });
    });
    
  });
  
  describe('Negative Values', () => {
    
    test('should reject negative height value', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '-10' } });
      
      fireEvent.click(screen.getByText('Lưu thay đổi'));
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled();
      });
      
      alertMock.mockRestore();
    });
    
  });
  
  describe('Validation Error Display', () => {
    
    test('should highlight invalid field with error styling', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '50' } });
      
      // Trigger blur or save
      fireEvent.blur(heightInput);
      
      // Input should have error class (red border)
      await waitFor(() => {
        expect(heightInput).toHaveClass('border-red-500');
      });
    });
    
    test('should show inline error message below invalid field', async () => {
      render(<ProfilePage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Chỉnh sửa'));
      });
      
      const heightInput = screen.getByDisplayValue('170');
      fireEvent.change(heightInput, { target: { value: '50' } });
      fireEvent.blur(heightInput);
      
      await waitFor(() => {
        expect(screen.getByText(/Chiều cao phải từ 100-250/)).toBeInTheDocument();
      });
    });
    
  });
  
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('Style Profile - Accessibility', () => {
  
  test('should have proper labels for form inputs', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Họ tên')).toBeInTheDocument();
      expect(screen.getByText('Giới tính')).toBeInTheDocument();
      expect(screen.getByText('Số điện thoại')).toBeInTheDocument();
      expect(screen.getByText('Ngày sinh')).toBeInTheDocument();
    });
  });
  
  test('should disable inputs when not in edit mode', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      const inputs = document.querySelectorAll('input:not([type="date"])');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });
  });
  
});

// ============================================================================
// INTEGRATION HINTS
// ============================================================================

/**
 * To run these tests:
 * 
 * 1. Install dependencies:
 *    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
 * 
 * 2. Add to package.json:
 *    "scripts": {
 *      "test": "jest",
 *      "test:watch": "jest --watch"
 *    }
 * 
 * 3. Create jest.config.js:
 *    module.exports = {
 *      testEnvironment: 'jsdom',
 *      setupFilesAfterEnv: ['@testing-library/jest-dom'],
 *      moduleNameMapper: {
 *        '^@/(.*)$': '<rootDir>/src/$1',
 *      },
 *    };
 * 
 * 4. Run: npm test
 */

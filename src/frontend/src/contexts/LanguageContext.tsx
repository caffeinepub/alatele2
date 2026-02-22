import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fa';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    app: {
      name: 'Alatele',
      tagline: 'Secure messaging platform',
    },
    login: {
      admin: {
        title: 'Admin Login',
        description: 'Login with your admin credentials',
        username: 'Username',
        usernamePlaceholder: 'Enter your username',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        passwordRequired: 'Password is required',
        displayName: 'Display Name',
        displayNameOptional: '(optional)',
        displayNamePlaceholder: 'Enter display name',
        button: 'Login as Admin',
        loggingIn: 'Logging in...',
        errorRequired: 'Username is required',
        errorInvalid: 'Invalid credentials',
      },
      guest: {
        title: 'Guest Access',
        description: 'Quick access for guests',
        button: 'Continue as Guest',
        info: 'No password required - just enter a username',
        features: 'Guest Features',
        feature1: 'Send messages to admins',
        feature2: 'View public messages',
        feature3: 'Simple username-only access',
        reservedUsernameError: 'This username is reserved for admin only',
        usernameTakenError: 'Username already taken',
      },
    },
    username: {
      title: 'Enter your username',
      placeholder: 'Choose a username',
      button: 'Continue',
    },
    header: {
      logout: 'Logout',
      adminPanel: 'Admin Panel',
    },
    chat: {
      groupChat: 'Group Chat',
      privateMessages: 'Private Messages',
      placeholder: 'Type a message...',
      send: 'Send',
      noMessages: 'No messages yet',
      startConversation: 'Start a conversation',
    },
    adminPanel: {
      title: 'Admin Panel',
      contacts: 'Manage Contacts',
      settings: 'Settings',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      passwordUpdated: 'Password updated successfully',
      passwordError: 'Failed to update password',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
    },
    contacts: {
      title: 'Contact Manager',
      myContacts: 'My Contacts',
      availableUsers: 'Available Users',
      addContact: 'Add Contact',
      noContacts: 'No contacts yet',
      noUsers: 'No available users',
    },
  },
  fa: {
    app: {
      name: 'آلاتله',
      tagline: 'پلتفرم پیام‌رسانی امن',
    },
    login: {
      admin: {
        title: 'ورود مدیر',
        description: 'با اطلاعات مدیریتی خود وارد شوید',
        username: 'نام کاربری',
        usernamePlaceholder: 'نام کاربری خود را وارد کنید',
        password: 'رمز عبور',
        passwordPlaceholder: 'رمز عبور خود را وارد کنید',
        passwordRequired: 'رمز عبور الزامی است',
        displayName: 'نام نمایشی',
        displayNameOptional: '(اختیاری)',
        displayNamePlaceholder: 'نام نمایشی را وارد کنید',
        button: 'ورود به عنوان مدیر',
        loggingIn: 'در حال ورود...',
        errorRequired: 'نام کاربری الزامی است',
        errorInvalid: 'اطلاعات نامعتبر است',
      },
      guest: {
        title: 'دسترسی مهمان',
        description: 'دسترسی سریع برای مهمانان',
        button: 'ادامه به عنوان مهمان',
        info: 'بدون نیاز به رمز عبور - فقط نام کاربری وارد کنید',
        features: 'امکانات مهمان',
        feature1: 'ارسال پیام به مدیران',
        feature2: 'مشاهده پیام‌های عمومی',
        feature3: 'دسترسی ساده با نام کاربری',
        reservedUsernameError: 'این نام کاربری برای مدیر رزرو شده است',
        usernameTakenError: 'نام کاربری قبلاً استفاده شده است',
      },
    },
    username: {
      title: 'نام کاربری خود را وارد کنید',
      placeholder: 'یک نام کاربری انتخاب کنید',
      button: 'ادامه',
    },
    header: {
      logout: 'خروج',
      adminPanel: 'پنل مدیریت',
    },
    chat: {
      groupChat: 'گفتگوی گروهی',
      privateMessages: 'پیام‌های خصوصی',
      placeholder: 'پیام خود را بنویسید...',
      send: 'ارسال',
      noMessages: 'هنوز پیامی وجود ندارد',
      startConversation: 'گفتگو را شروع کنید',
    },
    adminPanel: {
      title: 'پنل مدیریت',
      contacts: 'مدیریت مخاطبین',
      settings: 'تنظیمات',
      changePassword: 'تغییر رمز عبور',
      currentPassword: 'رمز عبور فعلی',
      newPassword: 'رمز عبور جدید',
      confirmPassword: 'تأیید رمز عبور جدید',
      updatePassword: 'به‌روزرسانی رمز عبور',
      passwordUpdated: 'رمز عبور با موفقیت به‌روزرسانی شد',
      passwordError: 'خطا در به‌روزرسانی رمز عبور',
      passwordMismatch: 'رمزهای عبور مطابقت ندارند',
      passwordTooShort: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    },
    contacts: {
      title: 'مدیریت مخاطبین',
      myContacts: 'مخاطبین من',
      availableUsers: 'کاربران موجود',
      addContact: 'افزودن مخاطب',
      noContacts: 'هنوز مخاطبی وجود ندارد',
      noUsers: 'کاربر موجودی وجود ندارد',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('alatele_language');
    return (stored === 'fa' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('alatele_language', language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'fa' ? 'fa' : 'en';
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

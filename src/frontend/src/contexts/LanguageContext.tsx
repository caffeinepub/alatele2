import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en-US' | 'fa-IR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  'en-US': {
    'app.name': 'Alatele',
    'app.tagline': 'Choose how you want to join',
    'app.loading': 'Loading messages...',
    'app.noMessages': 'No messages yet.',
    'app.beFirst': 'Be the first to say hello!',
    'login.admin.title': 'Admin Login',
    'login.admin.description': 'Login with administrator credentials',
    'login.admin.username': 'Username',
    'login.admin.displayName': 'Display Name',
    'login.admin.displayNameOptional': '(Optional)',
    'login.admin.usernamePlaceholder': 'Enter username',
    'login.admin.displayNamePlaceholder': 'Enter display name',
    'login.admin.button': 'Login as Admin',
    'login.admin.loggingIn': 'Logging in...',
    'login.admin.errorRequired': 'Username is required',
    'login.admin.errorInvalid': 'Invalid username',
    'login.guest.title': 'Guest Login',
    'login.guest.description': 'Join the conversation as a guest',
    'login.guest.info': 'No password required. Just choose a username and start chatting!',
    'login.guest.button': 'Continue as Guest',
    'login.guest.features': 'Guest Features',
    'login.guest.feature1': 'Send text messages',
    'login.guest.feature2': 'Share images and videos',
    'login.guest.feature3': 'Send audio messages',
    'login.guest.reservedUsernameError': 'Username "Alaie" is reserved for admin only',
    'login.guest.usernameTakenError': 'Username is already taken',
    'username.title': 'Enter a username to join the conversation',
    'username.placeholder': 'Choose your username...',
    'username.button': 'Enter Chat',
    'header.loggedInAs': 'Logged in as',
    'header.logout': 'Logout',
    'message.placeholder': 'Type a message...',
    'message.send': 'Send',
    'message.edit': 'Edit',
    'message.delete': 'Delete',
    'message.cancel': 'Cancel',
    'message.save': 'Save',
    'message.uploading': 'Uploading...',
    'message.sharedImage': 'Shared image',
    'message.videoNotSupported': 'Your browser does not support the video tag.',
    'message.audioNotSupported': 'Your browser does not support the audio tag.',
    'message.fileAttached': 'File attached',
    'audio.record': 'Record Audio',
    'audio.recording': 'Recording...',
    'audio.audioMessage': 'Audio Message',
    'audio.permissionError': 'Microphone access denied. Please allow microphone access to record audio.',
    'admin.panel': 'Admin Panel',
    'admin.backToChat': 'Back to Chat',
    'admin.backToPanel': 'Back to Panel',
    'admin.accessDenied': 'Access Denied',
    'admin.accessDeniedMessage': 'You do not have permission to access the admin panel. Only administrators can view this page.',
    'admin.title': 'Admin Dashboard',
    'admin.description': 'Manage messages and view analytics',
    'admin.password.title': 'Password Settings',
    'admin.password.manage': 'Change Password',
    'admin.password.changeTitle': 'Change Admin Password',
    'admin.password.changeDescription': 'Update your administrator password for enhanced security',
    'admin.password.current': 'Current Password',
    'admin.password.currentPlaceholder': 'Enter current password',
    'admin.password.new': 'New Password',
    'admin.password.newPlaceholder': 'Enter new password',
    'admin.password.confirm': 'Confirm New Password',
    'admin.password.confirmPlaceholder': 'Confirm new password',
    'admin.password.changeButton': 'Change Password',
    'admin.password.changing': 'Changing...',
    'admin.password.errorRequired': 'All fields are required',
    'admin.password.errorMismatch': 'New passwords do not match',
    'admin.password.errorTooShort': 'Password must be at least 6 characters long',
    'admin.password.errorGeneric': 'Failed to change password. Please try again.',
    'admin.password.success': 'Password changed successfully!',
    'language.english': 'English',
    'language.farsi': 'فارسی',
    'language.switch': 'Switch Language',
    'chat.groupChat': 'Group Chat',
    'chat.privateMessages': 'Private Messages',
    'chat.privateConversation': 'Private Conversation',
    'chat.noConversations': 'No conversations yet',
    'chat.noConversationsAdmin': 'Add contacts to start private conversations',
    'chat.noConversationsGuest': 'Wait for an admin to add you as a contact',
    'chat.conversationsDescription': 'Your private conversations',
    'chat.mediaMessage': 'Media message',
    'contacts.manage': 'Manage Contacts',
    'contacts.manageDescription': 'Add and manage your contacts for private messaging',
    'contacts.myContacts': 'My Contacts',
    'contacts.myContactsDescription': 'Users you can send private messages to',
    'contacts.noContacts': 'No contacts yet. Add users below to start private conversations.',
    'contacts.addContacts': 'Add Contacts',
    'contacts.addContactsDescription': 'Select users to add as contacts',
    'contacts.noAvailableUsers': 'All available users have been added as contacts.',
    'contacts.add': 'Add',
    'contacts.adding': 'Adding...',
  },
  'fa-IR': {
    'app.name': 'آلاتله',
    'app.tagline': 'نحوه ورود خود را انتخاب کنید',
    'app.loading': 'در حال بارگذاری پیام‌ها...',
    'app.noMessages': 'هنوز پیامی وجود ندارد.',
    'app.beFirst': 'اولین نفری باشید که سلام می‌کند!',
    'login.admin.title': 'ورود مدیر',
    'login.admin.description': 'ورود با اطلاعات مدیریتی',
    'login.admin.username': 'نام کاربری',
    'login.admin.displayName': 'نام نمایشی',
    'login.admin.displayNameOptional': '(اختیاری)',
    'login.admin.usernamePlaceholder': 'نام کاربری را وارد کنید',
    'login.admin.displayNamePlaceholder': 'نام نمایشی را وارد کنید',
    'login.admin.button': 'ورود به عنوان مدیر',
    'login.admin.loggingIn': 'در حال ورود...',
    'login.admin.errorRequired': 'نام کاربری الزامی است',
    'login.admin.errorInvalid': 'نام کاربری نامعتبر است',
    'login.guest.title': 'ورود مهمان',
    'login.guest.description': 'به عنوان مهمان به گفتگو بپیوندید',
    'login.guest.info': 'نیازی به رمز عبور نیست. فقط یک نام کاربری انتخاب کنید و شروع به چت کنید!',
    'login.guest.button': 'ادامه به عنوان مهمان',
    'login.guest.features': 'امکانات مهمان',
    'login.guest.feature1': 'ارسال پیام متنی',
    'login.guest.feature2': 'اشتراک‌گذاری تصاویر و ویدیوها',
    'login.guest.feature3': 'ارسال پیام صوتی',
    'login.guest.reservedUsernameError': 'نام کاربری "Alaie" برای مدیر رزرو شده است',
    'login.guest.usernameTakenError': 'این نام کاربری قبلاً استفاده شده است',
    'username.title': 'برای پیوستن به گفتگو نام کاربری وارد کنید',
    'username.placeholder': 'نام کاربری خود را انتخاب کنید...',
    'username.button': 'ورود به چت',
    'header.loggedInAs': 'وارد شده به عنوان',
    'header.logout': 'خروج',
    'message.placeholder': 'پیام خود را بنویسید...',
    'message.send': 'ارسال',
    'message.edit': 'ویرایش',
    'message.delete': 'حذف',
    'message.cancel': 'لغو',
    'message.save': 'ذخیره',
    'message.uploading': 'در حال بارگذاری...',
    'message.sharedImage': 'تصویر اشتراک‌گذاری شده',
    'message.videoNotSupported': 'مرورگر شما از برچسب ویدیو پشتیبانی نمی‌کند.',
    'message.audioNotSupported': 'مرورگر شما از برچسب صوتی پشتیبانی نمی‌کند.',
    'message.fileAttached': 'فایل پیوست شده',
    'audio.record': 'ضبط صدا',
    'audio.recording': 'در حال ضبط...',
    'audio.audioMessage': 'پیام صوتی',
    'audio.permissionError': 'دسترسی به میکروفون رد شد. لطفاً برای ضبط صدا، دسترسی به میکروفون را مجاز کنید.',
    'admin.panel': 'پنل مدیریت',
    'admin.backToChat': 'بازگشت به چت',
    'admin.backToPanel': 'بازگشت به پنل',
    'admin.accessDenied': 'دسترسی رد شد',
    'admin.accessDeniedMessage': 'شما مجوز دسترسی به پنل مدیریت را ندارید. فقط مدیران می‌توانند این صفحه را مشاهده کنند.',
    'admin.title': 'داشبورد مدیریت',
    'admin.description': 'مدیریت پیام‌ها و مشاهده تحلیل‌ها',
    'admin.password.title': 'تنظیمات رمز عبور',
    'admin.password.manage': 'تغییر رمز عبور',
    'admin.password.changeTitle': 'تغییر رمز عبور مدیر',
    'admin.password.changeDescription': 'برای امنیت بیشتر، رمز عبور مدیریتی خود را به‌روزرسانی کنید',
    'admin.password.current': 'رمز عبور فعلی',
    'admin.password.currentPlaceholder': 'رمز عبور فعلی را وارد کنید',
    'admin.password.new': 'رمز عبور جدید',
    'admin.password.newPlaceholder': 'رمز عبور جدید را وارد کنید',
    'admin.password.confirm': 'تأیید رمز عبور جدید',
    'admin.password.confirmPlaceholder': 'رمز عبور جدید را تأیید کنید',
    'admin.password.changeButton': 'تغییر رمز عبور',
    'admin.password.changing': 'در حال تغییر...',
    'admin.password.errorRequired': 'همه فیلدها الزامی هستند',
    'admin.password.errorMismatch': 'رمزهای عبور جدید مطابقت ندارند',
    'admin.password.errorTooShort': 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    'admin.password.errorGeneric': 'تغییر رمز عبور ناموفق بود. لطفاً دوباره تلاش کنید.',
    'admin.password.success': 'رمز عبور با موفقیت تغییر یافت!',
    'language.english': 'English',
    'language.farsi': 'فارسی',
    'language.switch': 'تغییر زبان',
    'chat.groupChat': 'چت گروهی',
    'chat.privateMessages': 'پیام‌های خصوصی',
    'chat.privateConversation': 'گفتگوی خصوصی',
    'chat.noConversations': 'هنوز گفتگویی وجود ندارد',
    'chat.noConversationsAdmin': 'برای شروع گفتگوهای خصوصی، مخاطبین را اضافه کنید',
    'chat.noConversationsGuest': 'منتظر بمانید تا یک مدیر شما را به عنوان مخاطب اضافه کند',
    'chat.conversationsDescription': 'گفتگوهای خصوصی شما',
    'chat.mediaMessage': 'پیام رسانه‌ای',
    'contacts.manage': 'مدیریت مخاطبین',
    'contacts.manageDescription': 'افزودن و مدیریت مخاطبین برای پیام‌رسانی خصوصی',
    'contacts.myContacts': 'مخاطبین من',
    'contacts.myContactsDescription': 'کاربرانی که می‌توانید به آن‌ها پیام خصوصی ارسال کنید',
    'contacts.noContacts': 'هنوز مخاطبی وجود ندارد. کاربران زیر را اضافه کنید تا گفتگوهای خصوصی را شروع کنید.',
    'contacts.addContacts': 'افزودن مخاطبین',
    'contacts.addContactsDescription': 'کاربران را برای افزودن به عنوان مخاطب انتخاب کنید',
    'contacts.noAvailableUsers': 'همه کاربران موجود به عنوان مخاطب اضافه شده‌اند.',
    'contacts.add': 'افزودن',
    'contacts.adding': 'در حال افزودن...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('alatele2_language');
    return (stored as Language) || 'en-US';
  });

  useEffect(() => {
    localStorage.setItem('alatele2_language', language);
    document.documentElement.dir = language === 'fa-IR' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en-US']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

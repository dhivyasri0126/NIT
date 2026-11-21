import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    brandName: "Sri Murukku Foods",
    brandTagline: "Food Manufacturing ERP",
    dashboard: "Dashboard",
    salesAndOrders: "Sales & Orders",
    createOrder: "Create Order",
    orders: "Orders",
    invoices: "Invoices",
    dispatches: "Dispatches",
    returns: "Returns",
    productionManagement: "Production Management",
    productionRun: "Production Run",
    bom: "Bill of Materials (BOM)",
    productionPlan: "Production Plan",
    productionHistory: "Production History",
    inventory: "Inventory",
    stockOverview: "Stock Overview",
    rawMaterials: "Raw Materials",
    packagingMaterials: "Packaging Materials",
    finishedGoods: "Finished Goods",
    stockLedger: "Stock Ledger",
    stockAdjustments: "Stock Adjustments",
    purchases: "Purchases",
    productCosting: "Product Costing",
    paymentsReceivables: "Payments & Receivables",
    reportsAudit: "Reports & Audit",
    masterData: "Master Data",
    userManagement: "User Management",
    settings: "Settings",
    // Metrics & Labels
    todaysSales: "Today's Sales",
    pendingOrders: "Pending Orders",
    productionOutput: "Production Output",
    finishedStock: "Finished Stock",
    outstanding: "Outstanding",
    salesTrend: "Sales Trend",
    yield: "Yield",
    varianceAlerts: "Variance Alerts",
    productionFlow: "Production Flow",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    searchPlaceholder: "Search by order no., customer, item...",
    offlineMode: "Offline Mode",
    synced: "All changes synced",
    syncNow: "Sync Now",
    quickOrder: "Quick Order",
    switchRole: "Switch Role",
    exportPdf: "Export PDF",
    exportExcel: "Export Excel",
    exportCsv: "Export CSV",
    print: "Print",
  },
  ta: {
    brandName: "ஸ்ரீ முறுக்கு ஃபுட்ஸ்",
    brandTagline: "உணவு தயாரிப்பு ஈஆர்பி (ERP)",
    dashboard: "முகப்பு பலகை (Dashboard)",
    salesAndOrders: "விற்பனை & ஆர்டர்கள்",
    createOrder: "புதிய ஆர்டர் பதிவு",
    orders: "ஆர்டர் பட்டியல்",
    invoices: "ஜிஎஸ்டி இன்வாய்ஸ்",
    dispatches: "சரக்கு அனுப்புதல்",
    returns: "திரும்பப் பெறப்பட்டவை",
    productionManagement: "உற்பத்தி மேலாண்மை",
    productionRun: "தயாரிப்பு பேட்ச் (Run)",
    bom: "மூலப்பொருள் செய்முறை (BOM)",
    productionPlan: "உற்பத்தி திட்டம்",
    productionHistory: "உற்பத்தி வரலாறு",
    inventory: "இருப்பு நிலை (Inventory)",
    stockOverview: "இருப்பு மேலோட்டம்",
    rawMaterials: "மூலப்பொருட்கள்",
    packagingMaterials: "பேக்கிங் பொருட்கள்",
    finishedGoods: "தயாரான தின்பண்டங்கள்",
    stockLedger: "இருப்பு லெட்ஜர்",
    stockAdjustments: "இருப்பு சரிசெய்தல்",
    purchases: "கொள்முதல் (Purchases)",
    productCosting: "தயாரிப்பு அடக்க விலை",
    paymentsReceivables: "பணம் செலுத்துதல் & நிலுவை",
    reportsAudit: "அறிக்கைகள் & தணிக்கை",
    masterData: "முதன்மை தகவல் (Master Data)",
    userManagement: "பயனர் மேலாண்மை",
    settings: "அமைப்புகள் (Settings)",
    todaysSales: "இன்றைய விற்பனை",
    pendingOrders: "நிலுவையில் உள்ள ஆர்டர்கள்",
    productionOutput: "இன்றைய உற்பத்தி",
    finishedStock: "இருப்பில் உள்ள தின்பண்டங்கள்",
    outstanding: "வரவேண்டிய நிலுவைத் தொகை",
    salesTrend: "விற்பனை வளர்ச்சி",
    yield: "உற்பத்தி விகிதம் (Yield)",
    varianceAlerts: "மாறுபாடு எச்சரிக்கைகள்",
    productionFlow: "உற்பத்தி செயல்முறை",
    inStock: "இருப்பில் உள்ளது",
    lowStock: "குறைந்த இருப்பு",
    outOfStock: "இருப்பு இல்லை",
    searchPlaceholder: "ஆர்டர் எண், வாடிக்கையாளர் அல்லது பொருளைத் தேடுங்கள்...",
    offlineMode: "ஆஃப்லைன் முறை",
    synced: "அனைத்து தரவுகளும் ஒத்திசைக்கப்பட்டது",
    syncNow: "இப்போதே ஒத்திசை",
    quickOrder: "விரைவு ஆர்டர்",
    switchRole: "பணியிடப் பங்கு மாற்றம்",
    exportPdf: "பிடிஎஃப் ஏற்றுமதி",
    exportExcel: "எக்செல் ஏற்றுமதி",
    exportCsv: "சிஎஸ்வி ஏற்றுமதி",
    print: "அச்சிடுக",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sri_murukku_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('sri_murukku_lang', nextLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

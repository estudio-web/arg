// firebase-config.js
export const firebaseConfig = {
apiKey: "AIzaSyBk5OE8h0WCYxh1Hod76xehCggRAWdkNxw",
  authDomain: "tiendas-944b7.firebaseapp.com",
  projectId: "tiendas-944b7",
  storageBucket: "tiendas-944b7.firebasestorage.app",
  messagingSenderId: "394107779191",
  appId: "1:394107779191:web:270163195b3e7d8f26ae72"
};

export const MEDIATOKEN = "1de3e00f4acb42305d5b8621ce7deebb";

export const APP_CONFIG = {
  currencySymbol: "$",
  whatsappNumber: "5490000000000",
  appName: "IN-STORE",
  paymentLink: "http://127.0.0.1:5500/payments/payments.html?u=c2Q2sYbqeYQc5GFHU1AodfJQ8O12&p=Z7sClHy1we4MK4sIINBQ",
};

// Planes disponibles del SaaS
export const PLANS = {
  trial:   { name: "Trial",   days: 14,  productLimit: 3,    isUnlimited: false, price: 0     },
  basic:   { name: "Básico",  days: 30,  productLimit: 60,   isUnlimited: false, price: 37999  },
  pro:     { name: "Pro",     days: 30,  productLimit: 150,  isUnlimited: false, price: 59999  },
  premium: { name: "Premium", days: 30,  productLimit: null, isUnlimited: true,  price: 89999 },
};


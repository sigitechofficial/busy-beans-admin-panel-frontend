# Security Analysis: Stripe Secret Key Exposure Risk

## Executive Summary
✅ **GOOD NEWS**: The Stripe **secret key is NOT exposed** in this project. However, there are several other **critical security vulnerabilities** that need immediate attention.

---

## 1. Stripe Secret Key - Status: ✅ SAFE

### Analysis:
- **Only Stripe PUBLIC key** is stored in the frontend code (`STRIPE_PUBLIC_KEY`)
- Public keys are safe to expose - they have limited permissions
- No Stripe secret keys (`sk_*` or `sk_test_*`) are present in the frontend
- Stripe secret keys should only exist on the backend server

### Current Implementation:
```javascript
// src/utilities/URL.js
export const STRIPE_PUBLIC_KEY = CURRENT?.STRIPE_PUBLIC_KEY || "";
```

**Verdict**: ✅ **Stripe secret keys are properly protected**

---

## 2. OTHER CRITICAL SECURITY ISSUES FOUND

### 🔴 **CRITICAL ISSUE #1: Google reCAPTCHA Secret Key Exposed**

**Location**: `src/utilities/URL.js` (Line 44)

```javascript
export const RECAPTCHA_SECRET_KEY = "6Lfy_PwrAAAAAJrwzEdV9ElaUlZNOTSRBkSPa9zZ";
```

**Risk**: 
- This is a SECRET key that should NEVER be in frontend code
- Exposed in the browser's JavaScript bundle
- Anyone can inspect it and bypass reCAPTCHA verification
- Can be used to generate false positive scores

**Usage in API Route**: `src/app/api/captcha/route.js`
```javascript
import { RECAPTCHA_SECRET_KEY } from "@/utilities/URL";

const captchaResponse = await fetch(
  `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${body.token}`,
  { method: "POST" }
);
```

**Severity**: 🔴 **CRITICAL**

---

### 🔴 **CRITICAL ISSUE #2: Google API Key Exposed**

**Location**: `src/utilities/URL.js` (Line 40)

```javascript
export const GOOGLE_API_KEY = "AIzaSyD68_vw1gGE7LVVjJ5ZShy7qWwm9Rq0CBQ";
```

**Risk**:
- Exposed in frontend code
- Can be abused for unauthorized API calls
- May incur unexpected charges
- Potential for quota exhaustion attacks

**Severity**: 🔴 **HIGH**

---

### 🔴 **CRITICAL ISSUE #3: Firebase Credentials Exposed**

**Location**: `src/utilities/firebase.js` (Lines 15-23)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBe_N_pMAS9EDgZ0TGmS2tXiP7rBm2Fjk0",
  authDomain: "busybeancoffee.firebaseapp.com",
  projectId: "busybeancoffee",
  storageBucket: "busybeancoffee.firebasestorage.app",
  messagingSenderId: "448906342814",
  appId: "1:448906342814:web:0bfffa4fcdbe5efeaba68f",
  measurementId: "G-CK9FG55D1Z",
};
```

**Risk**:
- All Firebase credentials are visible in frontend
- While Firebase has some frontend-exposed keys by design, the complete config with appId is sensitive
- Firebase Realtime Database/Firestore security rules must be properly set
- If rules are misconfigured, anyone could read/write data

**Severity**: 🟠 **MEDIUM** (depends on Firebase security rules)

---

### 🟠 **ISSUE #4: Hardcoded Environment Configuration**

**Location**: `src/utilities/URL.js` (Lines 1-30)

```javascript
const ENV = "staging"; // "local" | "staging" | "production"

const CONFIG = {
  local: {
    BASE_URL: "http://192.168.18.21:8013/",
    STRIPE_PUBLIC_KEY: "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl",
    RETURN_URL: "http://192.168.18.36:3000",
  },
  staging: {...},
  production: {...},
};
```

**Risk**:
- Environment is hardcoded instead of using `.env` files
- All environments mixed in same file
- IP addresses exposed for local development
- Difficult to manage credentials securely

**Severity**: 🟠 **HIGH**

---

### 🟠 **ISSUE #5: Access Token Stored in localStorage**

**Locations**: 
- `src/utilities/GetAPI.js` (Line 15)
- `src/utilities/PostAPI.js` (Line 5)
- `src/utilities/StatusErrorHandler.js` (Line 35)

```javascript
Authorization: `Bearer ${localStorage.getItem("accessToken")}`
```

**Risk**:
- localStorage is vulnerable to XSS attacks
- Any malicious script can read the token
- No protection against CSRF attacks
- Vulnerable to localStorage enumeration

**Best Practice**: Use httpOnly cookies instead

**Severity**: 🟠 **MEDIUM**

---

## 3. Summary Table

| Issue | Type | Severity | Status |
|-------|------|----------|--------|
| Stripe Secret Key | Exposure | N/A | ✅ SAFE |
| Google reCAPTCHA Secret | Exposure | 🔴 CRITICAL | ❌ EXPOSED |
| Google API Key | Exposure | 🔴 HIGH | ❌ EXPOSED |
| Firebase Credentials | Exposure | 🟠 MEDIUM | ⚠️ PARTIALLY EXPOSED |
| Hardcoded Environment | Configuration | 🟠 HIGH | ❌ RISKY |
| localStorage Token Storage | Architecture | 🟠 MEDIUM | ⚠️ VULNERABLE |

---

## 4. Remediation Recommendations

### 🚨 **IMMEDIATE ACTIONS (Do ASAP)**

1. **Rotate Exposed Keys**
   - Delete and regenerate ALL exposed API keys in Google Cloud
   - Regenerate reCAPTCHA keys
   - Regenerate Firebase API key
   - Update credentials in backend only

2. **Move Secret Keys to Environment Variables**
   ```env
   # .env.local (development only - NOT in git)
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lfy_Pw...
   
   # Backend only (.env or similar)
   RECAPTCHA_SECRET_KEY=6Lfy_PwrAAAAAJrw...
   GOOGLE_API_KEY=AIzaSyD68...
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Update reCAPTCHA Verification**
   - Move captcha validation to backend only
   - Never expose `RECAPTCHA_SECRET_KEY` to frontend
   - Backend makes the verification request

### ⚠️ **SHORT-TERM FIXES (This Sprint)**

1. **Fix Captcha API Route**
   ```javascript
   // ✅ CORRECT: Keep secret on backend only
   export async function POST(req) {
     const body = await req.json();
     const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
     
     const captchaResponse = await fetch(
       `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${body.token}`,
       { method: "POST" }
     );
     // ... rest of code
   }
   ```

2. **Update URL.js - Frontend Only**
   ```javascript
   // src/utilities/URL.js
   const ENV = process.env.NEXT_PUBLIC_ENV || "staging";
   
   const CONFIG = {
     staging: {
       BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
       // Only NEXT_PUBLIC_* keys here (safe to expose)
       STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
       RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
       RETURN_URL: process.env.NEXT_PUBLIC_RETURN_URL,
     },
     // ... other envs
   };
   
   // Remove hardcoded secrets!
   ```

3. **Setup .env.local and .env.production**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   .env.production
   ```

### 📋 **LONG-TERM IMPROVEMENTS (Next Sprint)**

1. **Switch to httpOnly Cookies**
   - Replace localStorage token with httpOnly cookies
   - Implement proper CSRF protection
   - Use middleware to validate requests

2. **Implement Server-Side API Proxying**
   - Create backend endpoints that validate requests
   - Backend handles secret key requests
   - Frontend only calls public backend endpoints

3. **Add Security Headers**
   ```javascript
   // next.config.mjs or middleware
   async headers() {
     return [{
       source: '/(.*)',
       headers: [
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-XSS-Protection', value: '1; mode=block' },
         { key: 'Content-Security-Policy', value: "default-src 'self'" },
       ],
     }];
   }
   ```

4. **Add Rate Limiting**
   - Implement rate limiting on API routes
   - Prevent brute force attacks
   - Monitor for suspicious activity

---

## 5. Specific to Stripe

### Current Status: ✅ SECURE
- Only `STRIPE_PUBLIC_KEY` (pk_*) is in frontend ✅
- No secret keys (sk_*) are exposed ✅
- PaymentForm uses Stripe.js properly ✅

### But Still Check:
- Ensure backend never returns Stripe secret keys in API responses
- Validate that Stripe webhook endpoints are properly secured
- Implement proper error handling without exposing internal details

---

## 6. Action Items Checklist

- [ ] Rotate all exposed API keys in Google Cloud Console
- [ ] Rotate Firebase API key
- [ ] Create `.env.local` with proper variable names
- [ ] Move all secrets to `.env` file (not in git)
- [ ] Update `src/utilities/URL.js` to use `process.env` variables
- [ ] Fix `src/app/api/captcha/route.js` to use `process.env.RECAPTCHA_SECRET_KEY`
- [ ] Update `.gitignore` to exclude `.env*` files
- [ ] Update GitHub repository (delete history with exposed keys)
- [ ] Review Firebase security rules
- [ ] Implement httpOnly cookies for authentication
- [ ] Add security headers to Next.js config
- [ ] Run `git log` to check if secrets were committed before
- [ ] Use `git filter-branch` or `BFG Repo-Cleaner` to remove secrets from history
- [ ] Notify team about security changes

---

## Conclusion

**Stripe Secret Key**: ✅ **NOT EXPOSED** - Your Stripe implementation is secure.

**Overall Project Security**: 🔴 **CRITICAL ISSUES FOUND** - The reCAPTCHA and Google API keys are exposed and need immediate remediation.

**Recommendation**: Treat this as a P0 security incident. Rotate keys immediately and implement environment-based configuration as described above.

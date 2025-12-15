# Tracking System - Auto-Fill Documentation

## ✅ How It Works

When users enter a tracking ID and select a courier, they are redirected to the official courier website with the **tracking ID automatically pre-filled** in the tracking field.

---

## 🔗 Courier URL Parameters

Each courier website accepts tracking IDs via URL parameters. Here's how we configure them:

### 1. DHL Express
```javascript
URL: https://www.dhl.com/pk-en/home/tracking/tracking-express.html
Parameters:
  - submit=1 (auto-submit the form)
  - tracking-id={TRACKING_ID}

Example:
https://www.dhl.com/pk-en/home/tracking/tracking-express.html?submit=1&tracking-id=1234567890
```

**Result:** DHL tracking page opens with tracking ID pre-filled and search automatically initiated.

---

### 2. UPS
```javascript
URL: https://www.ups.com/track
Parameters:
  - loc=en_US (locale)
  - tracknum={TRACKING_ID}
  - requester=ST/trackdetails (request type)

Example:
https://www.ups.com/track?loc=en_US&tracknum=1Z999AA10123456784&requester=ST/trackdetails
```

**Result:** UPS tracking page opens with tracking number pre-filled in the search field.

---

### 3. FedEx
```javascript
URL: https://www.fedex.com/fedextrack/
Parameters:
  - trknbr={TRACKING_ID}
  - cntry_code=pk (country code for Pakistan)

Example:
https://www.fedex.com/fedextrack/?trknbr=123456789012&cntry_code=pk
```

**Result:** FedEx tracking page opens with tracking number pre-filled.

---

## 🎯 User Flow

1. **User enters tracking ID** on your website
2. **User selects courier** (DHL, UPS, or FedEx)
3. **User clicks "Track Shipment"**
4. **System validates** inputs (tracking ID and courier selection)
5. **System constructs URL** with proper parameters
6. **System opens courier website** in new tab
7. **Courier website displays** tracking information with ID pre-filled

---

## 💻 Implementation Code

```javascript
function trackShipment() {
    const trackingId = document.getElementById('tracking-id').value.trim();
    const courier = document.getElementById('courier-select').value;

    // Validation
    if (!trackingId) {
        alert("Please enter a tracking ID");
        return;
    }

    if (!courier) {
        alert("Please select a courier");
        return;
    }

    // Build URL with tracking ID
    let trackingUrl = '';

    switch (courier) {
        case 'dhl':
            trackingUrl = `https://www.dhl.com/pk-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(trackingId)}`;
            break;
        case 'ups':
            trackingUrl = `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(trackingId)}&requester=ST/trackdetails`;
            break;
        case 'fedex':
            trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingId)}&cntry_code=pk`;
            break;
    }

    // Open in new tab
    if (trackingUrl) {
        window.open(trackingUrl, '_blank');
    }
}
```

---

## 🔒 Security Features

### URL Encoding
```javascript
encodeURIComponent(trackingId)
```

**Purpose:**
- Prevents XSS attacks
- Handles special characters
- Ensures URL validity

**Example:**
- Input: `ABC-123 #456`
- Encoded: `ABC-123%20%23456`

---

## ✨ User Experience Benefits

### 1. **Convenience**
- No need to copy/paste tracking ID
- One-click tracking
- Seamless experience

### 2. **Accuracy**
- Eliminates typing errors
- Ensures correct tracking ID
- Reduces user frustration

### 3. **Speed**
- Instant redirection
- No manual entry required
- Faster tracking process

### 4. **Professional**
- Smooth integration
- Branded experience
- Trust-building

---

## 📱 Mobile Optimization

The system works perfectly on mobile devices:

- **Touch-friendly** form inputs
- **Large buttons** for easy clicking
- **Auto-focus** on tracking field
- **Enter key support** for quick submission
- **New tab** opens in mobile browser

---

## 🧪 Testing Guide

### Test Case 1: DHL Tracking
```
1. Enter tracking ID: "1234567890"
2. Select courier: "DHL Express"
3. Click "Track Shipment"
4. Verify: DHL page opens with ID pre-filled
```

### Test Case 2: UPS Tracking
```
1. Enter tracking ID: "1Z999AA10123456784"
2. Select courier: "UPS"
3. Click "Track Shipment"
4. Verify: UPS page opens with ID pre-filled
```

### Test Case 3: FedEx Tracking
```
1. Enter tracking ID: "123456789012"
2. Select courier: "FedEx"
3. Click "Track Shipment"
4. Verify: FedEx page opens with ID pre-filled
```

### Test Case 4: Validation
```
1. Leave tracking ID empty
2. Click "Track Shipment"
3. Verify: Alert "Please enter a tracking ID"

4. Enter tracking ID
5. Leave courier unselected
6. Click "Track Shipment"
7. Verify: Alert "Please select a courier"
```

### Test Case 5: Special Characters
```
1. Enter tracking ID: "ABC-123 #456"
2. Select any courier
3. Click "Track Shipment"
4. Verify: URL properly encodes special characters
```

---

## 🔧 Troubleshooting

### Issue: Tracking ID not appearing on courier site

**Possible Causes:**
1. Courier changed their URL structure
2. Parameter name changed
3. Browser blocking pop-ups

**Solutions:**
1. Check courier website for updated URL format
2. Update parameter names in code
3. Allow pop-ups for your domain

---

### Issue: New tab blocked

**Cause:** Browser pop-up blocker

**Solution:**
```javascript
// Alternative: Use window.location instead of window.open
window.location.href = trackingUrl;
// Note: This replaces current page instead of opening new tab
```

---

## 📊 Supported Couriers

| Courier | Parameter Name | Auto-Fill | Status |
|---------|---------------|-----------|--------|
| DHL Express | `tracking-id` | ✅ Yes | Active |
| UPS | `tracknum` | ✅ Yes | Active |
| FedEx | `trknbr` | ✅ Yes | Active |

---

## 🚀 Future Enhancements

### Potential Additions:
1. **More Couriers:**
   - Aramex
   - TNT
   - USPS
   - Royal Mail

2. **Smart Detection:**
   - Auto-detect courier from tracking ID format
   - Pre-select courier automatically

3. **Tracking History:**
   - Save recent tracking IDs
   - Quick re-track feature

4. **Direct API Integration:**
   - Fetch tracking data directly
   - Display on your website
   - No external redirect needed

---

## 📝 Notes

- All tracking is done via official courier websites
- No tracking data is stored on your server
- Users get real-time information from source
- Complies with courier terms of service
- No API keys required (Phase 1)

---

**Status:** ✅ **FULLY FUNCTIONAL**

**Version:** 1.0
**Last Updated:** 2025-12-14
**Tested:** DHL, UPS, FedEx

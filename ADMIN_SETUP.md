# Admin Panel Setup Guide

## Quick Setup

### 1. Create an Admin User in Firebase

To access the admin panel, you need to set a user's role to "admin" in Firebase Firestore.

#### Option A: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Select the user you want to make admin
6. Add a new field:
   - **Field name**: `role`
   - **Type**: `string`
   - **Value**: `admin`
7. Save the document

#### Option B: Using Firebase Admin SDK (Backend)

Add this temporary route to `backend/routes/auth.js` (remove after use):

```javascript
// TEMPORARY: Make user admin - REMOVE IN PRODUCTION
router.post("/make-admin/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await updateUser(userId, { role: "admin" });
    res.json({ message: "User is now admin" });
  } catch (error) {
    res.status(500).json({ error: "Failed to make user admin" });
  }
});
```

Then call it with:

```bash
curl -X POST http://localhost:5000/api/auth/make-admin/YOUR_USER_ID
```

### 2. Access the Admin Panel

1. **Login** to your SkillSwap account with the admin user
2. You'll see an **"Admin"** link with a shield icon in the navigation bar
3. Click on it to access the admin dashboard at `/admin`

## Admin Features

### Overview Tab

- View platform statistics
- Monitor user growth
- Track session completion
- See total matches and messages

### Users Tab

- View all registered users
- Search by name, email, or username
- Filter by status (active/inactive)
- Activate/deactivate users
- Bulk actions for multiple users
- Pagination for large user lists

### Reports Tab (Coming Soon)

- Content moderation
- User reports
- Inappropriate content handling

### System Tab (Coming Soon)

- System health monitoring
- Error logs
- Performance metrics

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never expose admin creation in production**

   - Remove any temporary admin-making routes
   - Only create admins through Firebase Console or secure admin tools

2. **Protect admin routes**

   - All admin routes check for `role: "admin"`
   - Non-admin users get 403 Forbidden responses

3. **Audit admin actions**

   - Consider logging all admin actions
   - Track who made changes and when

4. **Limit admin accounts**
   - Only create admin accounts for trusted individuals
   - Regularly review who has admin access

## Troubleshooting

### "Access denied. Admin privileges required."

**Problem**: User doesn't have admin role
**Solution**:

1. Verify the user document in Firebase has `role: "admin"`
2. Check spelling (must be lowercase "admin")
3. Refresh the page after adding role
4. Re-login if necessary

### Admin link not showing in navbar

**Problem**: User role not detected
**Solution**:

1. Ensure user document has `role: "admin"`
2. Check that AuthContext is properly loading user data
3. Clear browser cache and reload
4. Check browser console for errors

### "Failed to load statistics"

**Problem**: Backend admin routes not accessible
**Solution**:

1. Verify backend server is running
2. Check that `backend/routes/admin.js` exists
3. Confirm admin routes are registered in `server.js`
4. Check network tab for 404 or 500 errors

## Testing Admin Features

### Test User Management

1. Navigate to **Users** tab
2. Try searching for users
3. Filter by status
4. Select multiple users
5. Try bulk activate/deactivate (test with test accounts only!)

### Test Statistics

1. Check if statistics show correct counts
2. Verify numbers match your database
3. Test with new user registrations
4. Create test sessions and matches

## Production Considerations

### Before deploying to production:

1. **Remove test admin routes**
   - Delete any temporary admin-making endpoints
2. **Set up proper admin creation flow**

   - Use Firebase Functions with admin authentication
   - Or manually create admins through Firebase Console

3. **Add activity logging**

   - Log all admin actions to a separate collection
   - Include: admin ID, action type, timestamp, affected users

4. **Implement rate limiting**

   - Protect admin endpoints from abuse
   - Add additional security checks

5. **Set up monitoring**
   - Monitor admin panel usage
   - Alert on suspicious admin activity
   - Track failed admin access attempts

## Example: Complete Admin User Document

```json
{
  "id": "abc123xyz",
  "username": "admin",
  "email": "admin@skillswap.com",
  "role": "admin",
  "profile": {
    "name": "Admin User",
    "avatar": "https://...",
    "bio": "Platform Administrator"
  },
  "isActive": true,
  "createdAt": "2025-10-30T10:00:00.000Z",
  "skills": {
    "teachable": [],
    "desired": []
  }
}
```

## API Endpoints Reference

All admin endpoints require authentication and admin role:

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List users (with pagination and filters)
- `PATCH /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Deactivate/delete user
- `POST /api/admin/bulk-action` - Bulk user actions
- `GET /api/admin/reports` - Get reports (future)
- `PATCH /api/admin/reports/:reportId` - Handle report (future)
- `GET /api/admin/activity` - Activity logs
- `GET /api/admin/health` - System health

## Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify Firebase Firestore rules allow admin operations
4. Ensure all environment variables are set correctly

---

**Note**: This admin panel is designed for internal use. Never expose admin credentials or allow public admin registration.

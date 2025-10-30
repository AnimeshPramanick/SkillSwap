# Profile, Settings, and Admin Panel Guide

## ✅ What's Been Implemented

### 1. **Profile Page** (`/profile`)

Now fully functional with:

- **Avatar Upload**: Click the camera icon on your avatar to upload a new profile picture
- **Edit Profile**: Update your name, bio, location, and timezone
- **Skills Management**:
  - Add skills you can teach (shown in blue badges)
  - Add skills you want to learn (shown in green badges)
  - Remove skills by clicking the X on each badge
- **Statistics Display**: View your total sessions, hours, and average rating

### 2. **Settings Page** (`/settings`)

Now fully functional with three tabs:

#### Notifications Tab

- Toggle email notifications on/off
- Toggle push notifications on/off
- Control notifications for new matches
- Control notifications for new messages

#### Privacy Tab

- Show/hide your online status to other users
- Show/hide your location on your profile

#### Account Tab

- View your account information (username, email, role, join date)
- Edit Profile button (links to Profile page)
- **Deactivate Account** button (in the Danger Zone)

### 3. **Admin Panel** (`/admin`)

Already implemented and now accessible!

---

## 🔐 How to Access the Admin Panel

Since your Firebase user already has `role: "Admin"`, you should now see the **Admin** link in the navigation bar!

### Steps:

1. **Refresh your browser** (press `Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Look at the navigation bar at the top
3. You should see an **"Admin"** link with a shield icon (🛡️) next to Sessions
4. Click on it to access the admin dashboard

### Why it works now:

- Your role is `"Admin"` (capitalized)
- I updated the code to check for admin role **case-insensitively**
- Both `"admin"` and `"Admin"` will now work

---

## 📝 Using the Profile Page

### To Update Your Profile:

1. Go to `/profile` (click on your avatar in the navbar)
2. Click **"Edit Profile"** button
3. Update your information:
   - Full Name
   - Bio (max 500 characters)
   - Location
   - Timezone
4. Click **"Save Changes"**

### To Upload Avatar:

1. Go to `/profile`
2. Click the **camera icon** on your avatar
3. Select an image file (max 5MB)
4. Image will upload and your avatar will update automatically

### To Manage Skills:

#### Add Skills You Can Teach:

1. Type the skill name in the first input box
2. Click the **+** button
3. Skill appears as a blue badge

#### Add Skills You Want to Learn:

1. Type the skill name in the second input box
2. Click the **+** button
3. Skill appears as a green badge

#### Remove Skills:

- Click the **X** button on any skill badge to remove it

---

## ⚙️ Using the Settings Page

### Notifications Settings:

1. Go to `/settings`
2. Select **"Notifications"** tab (default)
3. Toggle switches to enable/disable:
   - Email notifications
   - Push notifications
   - Match notifications
   - Message notifications
4. Click **"Save Changes"**

### Privacy Settings:

1. Go to `/settings`
2. Select **"Privacy"** tab
3. Toggle switches:
   - **Show online status**: Others can see when you're online
   - **Show location**: Your location appears on your profile
4. Click **"Save Changes"**

### Account Management:

1. Go to `/settings`
2. Select **"Account"** tab
3. View your account details:
   - Username: `Animesh`
   - Email: `apramanick916@gmail.com`
   - Role: `Admin`
   - Member Since: October 30, 2025

#### To Deactivate Account:

⚠️ **Warning**: This will log you out and deactivate your account

1. Scroll to "Danger Zone"
2. Click **"Deactivate Account"**
3. Confirm the action
4. You'll be logged out (can reactivate by logging in again)

---

## 🛡️ Using the Admin Panel

Once you access `/admin`, you'll see:

### Overview Tab

- Total users, matches, sessions, and messages
- User status breakdown (active/inactive)
- Growth metrics (new users and sessions last 30 days)
- Session activity statistics

### Users Tab

- View all registered users
- Search users by name, email, or username
- Filter by status (all, active, inactive)
- Select multiple users with checkboxes
- Bulk actions:
  - Activate multiple users at once
  - Deactivate multiple users at once
- Individual user actions:
  - Activate/Deactivate single users
- Pagination for large user lists

### Reports Tab (Placeholder)

- Coming soon: Content moderation features

### System Tab (Placeholder)

- Coming soon: System health monitoring

---

## 🎨 Features Highlights

### Profile Page Features:

✅ Avatar upload with drag-and-drop support
✅ Real-time profile updates
✅ Skills management with visual badges
✅ Statistics dashboard
✅ Responsive design for mobile/tablet/desktop

### Settings Page Features:

✅ Tabbed interface for easy navigation
✅ Toggle switches for quick settings changes
✅ Privacy controls for visibility
✅ Account deactivation option
✅ Instant feedback with toast notifications

### Admin Panel Features:

✅ Platform-wide statistics
✅ User management with search and filters
✅ Bulk user operations
✅ Secure role-based access control
✅ Clean, professional dashboard design

---

## 🔧 Technical Details

### API Endpoints Used:

**Profile Management:**

- `PUT /api/users/profile` - Update profile information
- `POST /api/users/upload-avatar` - Upload avatar image
- `POST /api/skills/teachable` - Add teachable skills
- `POST /api/skills/desired` - Add desired skills
- `DELETE /api/skills/teachable/:skill` - Remove teachable skill
- `DELETE /api/skills/desired/:skill` - Remove desired skill

**Settings Management:**

- `PUT /api/users/preferences/notifications` - Update notification settings
- `PUT /api/users/preferences/privacy` - Update privacy settings
- `DELETE /api/users/account` - Deactivate account

**Admin Operations:**

- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:userId` - Update user
- `POST /api/admin/bulk-action` - Bulk user actions

### State Management:

- All changes update the AuthContext automatically
- User data refreshes after profile updates
- Toast notifications provide instant feedback
- Loading states prevent duplicate submissions

---

## 🐛 Troubleshooting

### Admin Link Not Showing?

1. **Check your role in Firebase**: Should be `"Admin"` or `"admin"`
2. **Hard refresh**: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. **Clear cache**: Clear browser cache and reload
4. **Log out and log back in**: This refreshes your user data

### Avatar Upload Not Working?

- Ensure image is less than 5MB
- Use common image formats (JPG, PNG, GIF)
- Check browser console for errors
- Make sure Cloudinary is configured in backend

### Settings Not Saving?

- Check browser console for errors
- Verify backend server is running
- Check network tab for API response
- Ensure you're logged in

### Profile Updates Not Reflecting?

- Changes save immediately to the database
- Page should auto-refresh user data
- Try refreshing the page manually
- Check if toast notification shows success

---

## 🎯 Next Steps

Now that your profile and settings are functional, you can:

1. **Complete Your Profile**:

   - Upload a profile picture
   - Write a bio about yourself
   - Add your location and timezone
   - List your teachable skills
   - List skills you want to learn

2. **Customize Your Settings**:

   - Set your notification preferences
   - Configure privacy settings
   - Review your account information

3. **Explore Admin Features**:

   - Monitor platform statistics
   - Manage users if needed
   - Review growth metrics

4. **Start Using the Platform**:
   - Discover users with complementary skills
   - Create matches
   - Send messages
   - Schedule learning sessions

---

## 📊 Your Current Profile

Based on your Firebase data:

- **Name**: Animesh Pramanick
- **Username**: Animesh
- **Email**: apramanick916@gmail.com
- **Role**: Admin ✅
- **Member Since**: October 30, 2025
- **Skills**: None added yet (add some!)
- **Avatar**: Not uploaded yet (upload one!)
- **Bio**: Not set (write something!)

**Tip**: Start by completing your profile to make it more attractive to potential skill exchange partners!

---

## ✨ Pro Tips

1. **Avatar**: Use a clear, professional photo for better trust
2. **Bio**: Write 2-3 sentences about your background and interests
3. **Skills**: Add at least 3 skills you can teach and 3 you want to learn
4. **Location**: Add your city for local connections
5. **Timezone**: Set correctly for scheduling sessions
6. **Notifications**: Keep "New matches" enabled to not miss opportunities
7. **Privacy**: If you want more engagement, keep "Show online status" enabled

---

**Last Updated**: October 30, 2025
**Status**: ✅ All Features Functional

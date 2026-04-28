# Quick Setup Guide - New Features

## What's New?

Your Smart Campus Helpdesk System now includes:
- ✅ AI-powered ticket categorization
- ✅ Automated urgency prediction  
- ✅ Real-time notifications
- ✅ Staff ticket management
- ✅ Analytics & reporting dashboard
- ✅ Activity tracking & comments

## Installation (5 minutes)

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Email (Optional but Recommended)

Create/update your `.env` file in the `server` directory:

```env
# Email Notifications (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@smartcampus.ac.ke

# Set to 'production' to enable emails
NODE_ENV=production
```

**Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

### 3. Restart Server
```bash
npm run dev
```

The server will automatically create new database tables for notifications and comments.

## Quick Integration Guide

### For Students - Add to StudentDashboard.jsx

```jsx
import TicketSubmissionForm from '../components/TicketSubmissionForm';
import TicketTracker from '../components/TicketTracker';
import NotificationsWidget from '../components/NotificationsWidget';

export default function StudentDashboard() {
  return (
    <div className="student-dashboard">
      <NotificationsWidget autoRefresh={true} />
      <TicketSubmissionForm />
      <TicketTracker />
    </div>
  );
}
```

### For Staff - Add to StaffDashboard.jsx

```jsx
import StaffTicketManagement from '../components/StaffTicketManagement';
import NotificationsWidget from '../components/NotificationsWidget';

export default function StaffDashboard() {
  return (
    <div className="staff-dashboard">
      <NotificationsWidget autoRefresh={true} />
      <StaffTicketManagement />
    </div>
  );
}
```

### For Admin - Add to AdminDashboard.jsx

```jsx
import AnalyticalsDashboard from '../components/AnalyticalsDashboard';
import NotificationsWidget from '../components/NotificationsWidget';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <NotificationsWidget autoRefresh={true} />
      <AnalyticalsDashboard />
    </div>
  );
}
```

## New API Endpoints

### Tickets
- `POST /api/tickets` - Create ticket (auto-categorized)
- `GET /api/tickets` - List tickets (with filters)
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/comments` - Add comment
- `PUT /api/tickets/:id/status` - Update status
- `PUT /api/tickets/:id/priority` - Update priority
- `PUT /api/tickets/:id/assign` - Assign to staff

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/all/read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Reporting
- `GET /api/reporting/stats/overview` - Overview stats
- `GET /api/reporting/stats/staff-workload` - Staff metrics
- `GET /api/reporting/stats/trends` - Monthly trends
- `GET /api/reporting/stats/urgency-distribution` - Urgency data

## Testing

### Test Ticket Creation
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Error",
    "description": "Cannot login to email"
  }'
```

## Troubleshooting

### Emails not sending?
1. Check `NODE_ENV=production` in `.env`
2. Verify email credentials
3. Check server logs for errors
4. Ensure port 587 is not blocked

### Components not showing?
1. Make sure files are in `client/src/components/`
2. Check import paths match your project structure
3. Verify axios interceptor includes authentication token

### Database errors?
1. Delete and recreate a fresh database
2. Run `npm run dev` to sync Sequelize models
3. Check PostgreSQL is running
4. Verify database credentials in `.env`

## Documentation

See `FEATURES_ADDED.md` for complete technical documentation.

---

**Everything is ready to use!** 🚀

Integrate the components into your dashboard pages and start testing.

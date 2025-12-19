# MongoDB Setup Guide

## Where to Put Your MongoDB Connection String

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the **root directory** of your project (same level as `package.json`).

### Step 2: Add Your MongoDB Connection String

Open `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## Getting Your MongoDB Atlas Connection String

### If Using MongoDB Atlas (Cloud):

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click on your cluster
3. Click **"Connect"** button
4. Select **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<database>` with your database name (e.g., `faculty-feedback`)

**Example:**
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/faculty-feedback?retryWrites=true&w=majority
```

### If Using Local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/faculty-feedback
```

## Important Notes

- ⚠️ **Never commit `.env.local` to Git** - it's already in `.gitignore`
- 🔒 Keep your connection string secret
- ✅ Make sure MongoDB is running before starting the app
- 🌐 For production, update `NEXTAUTH_URL` to your domain

## Testing Connection

After setting up `.env.local`, run:

```bash
npm run seed
```

If the connection works, you'll see:
```
Connected to MongoDB
✅ Admin created: ayushnimade0@gmail.com Password: admin123
...
```

If you see connection errors, check:
1. Your connection string is correct
2. Your IP is whitelisted in MongoDB Atlas (if using Atlas)
3. Your database user has proper permissions


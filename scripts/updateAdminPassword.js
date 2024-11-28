import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Generate new password hash
    const newPassword = 'bouchmal01';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin user password
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@admin.com' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('Admin user not found');
    } else if (result.modifiedCount === 0) {
      console.log('Password was already updated');
    } else {
      console.log('Admin password updated successfully');
      console.log('New login credentials:');
      console.log('Email: admin@admin.com');
      console.log('Password: bouchmal01');
    }

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update function
updateAdminPassword();

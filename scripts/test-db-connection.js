const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Try to connect and run a simple query
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log('✅ Query executed successfully');
    console.log('📊 Database info:', result);
    
    // Check if the cars table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    console.log('📋 Tables in database:', tables);
    
    // Try to describe the cars table if it exists
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cars'
        ORDER BY ordinal_position
      `;
      console.log('🚗 Cars table columns:', columns);
      
      if (columns.length === 0) {
        console.log('⚠️  Cars table exists but has no columns or table name case mismatch');
      }
    } catch (error) {
      console.log('⚠️  Error checking cars table:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testConnection();

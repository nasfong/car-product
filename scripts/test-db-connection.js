import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.warn('🔄 Testing database connection...');
    
    // Try to connect and run a simple query
    await prisma.$connect();
    console.warn('✅ Database connected successfully!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.warn('✅ Query executed successfully');
    console.warn('📊 Database info:', result);
    
    // Check if the cars table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    console.warn('📋 Tables in database:', tables);
    
    // Try to describe the cars table if it exists
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cars'
        ORDER BY ordinal_position
      `;
      console.warn('🚗 Cars table columns:', columns);
      
      if (columns.length === 0) {
        console.warn('⚠️  Cars table exists but has no columns or table name case mismatch');
      }
    } catch (_error) {
      console.warn('Error checking cars table:', (_error as Error).message);
    }
    
  } catch (_error) {
    console.error('❌ Database connection failed:', _error);
    if (_error instanceof Error) {
      console.error('Error message:', _error.message);
    }
  } finally {
    await prisma.$disconnect();
    console.warn('🔌 Disconnected from database');
  }
}

testConnection();

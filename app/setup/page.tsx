'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkDatabaseSetup, getSampleData } from '@/lib/database-setup';

interface TableCheck {
  table: string;
  exists: boolean;
  error: any;
}

export default function SetupPage() {
  const [tableChecks, setTableChecks] = useState<TableCheck[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkSetup = async () => {
    setChecking(true);
    try {
      const checks = await checkDatabaseSetup();
      setTableChecks(checks);

      const data = await getSampleData();
      setSampleData(data);
    } catch (error) {
      console.error('Setup check failed:', error);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  const allTablesExist = tableChecks.every(check => check.exists);
  const hasData = sampleData?.categories?.length > 0 && sampleData?.products?.length > 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Database Setup Status</h1>
          <p className="text-xl text-muted-foreground">
            Check if your Supabase database is properly configured
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6" />
                <span>Overall Status</span>
                {checking && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {allTablesExist && hasData ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-lg font-semibold text-green-700">Setup Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Your database is properly configured with sample data
                      </p>
                    </div>
                  </>
                ) : allTablesExist && !hasData ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-lg font-semibold text-yellow-700">Tables Created, Missing Data</p>
                      <p className="text-sm text-muted-foreground">
                        Database tables exist but sample data is missing
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-lg font-semibold text-red-700">Setup Required</p>
                      <p className="text-sm text-muted-foreground">
                        Database migrations need to be applied
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Status */}
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>
                Status of required database tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tableChecks.map((check) => (
                  <div
                    key={check.table}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{check.table}</span>
                    {check.exists ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Exists
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Status */}
          {sampleData && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Data</CardTitle>
                <CardDescription>
                  Status of sample categories and products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Categories</h4>
                    <p className="text-2xl font-bold text-primary">
                      {sampleData.categories?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">categories found</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Products</h4>
                    <p className="text-2xl font-bold text-primary">
                      {sampleData.products?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">products found</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          {(!allTablesExist || !hasData) && (
            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to complete your database setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 1: Apply Database Migrations</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Copy the content from <code>supabase/migrations/20250617040742_emerald_disk.sql</code></li>
                    <li>Paste and run the SQL script</li>
                    <li>Copy the content from <code>supabase/migrations/20250620035656_mellow_plain.sql</code></li>
                    <li>Paste and run the second SQL script</li>
                  </ol>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Step 2: Verify Setup</h4>
                  <p className="text-sm">
                    After running the migrations, click the "Recheck Setup" button below to verify everything is working.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button onClick={checkSetup} disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Recheck Setup'
              )}
            </Button>
            
            {allTablesExist && hasData && (
              <Button asChild>
                <a href="/">Go to Homepage</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signUp } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    if (type === 'signup') {
      if (!formData.fullName.trim()) {
        toast.error('Full name is required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (type === 'signup') {
        await signUp(formData.email, formData.password, formData.fullName);
        toast.success('Account created successfully! You can now sign in.', {
          duration: 5000,
        });
        router.push('/auth/signin');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('Signed in successfully!');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An error occurred';
      
      if (error.message) {
        if (error.message.includes('email_address_invalid')) {
          errorMessage = 'Please enter a valid email address';
        } else if (error.message.includes('weak_password')) {
          errorMessage = 'Password is too weak. Please use at least 6 characters';
        } else if (error.message.includes('email_not_confirmed')) {
          errorMessage = 'Please check your email and confirm your account';
        } else if (error.message.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('signup_disabled')) {
          errorMessage = 'Account registration is currently disabled';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full animate-liquid"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl glass magnetic perspective-1000">
          <motion.div variants={itemVariants}>
            <CardHeader className="space-y-1 text-center">
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-gradient pulse-glow">
                  <Sparkles className="text-white font-bold text-lg" />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl font-bold holographic">
                  {type === 'signin' ? 'Welcome back' : 'Create account'}
                </CardTitle>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <CardDescription>
                  {type === 'signin' 
                    ? 'Sign in to your account to continue' 
                    : 'Enter your details to create your account'
                  }
                </CardDescription>
              </motion.div>
            </CardHeader>
          </motion.div>
          
          <CardContent>
            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
              <AnimatePresence mode="wait">
                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-10 glass magnetic"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 glass magnetic"
                      required
                      disabled={isLoading}
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 glass magnetic"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 magnetic"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                {type === 'signup' && (
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Password must be at least 6 characters long
                  </motion.p>
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                {type === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 glass magnetic"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 magnetic pulse-glow" 
                  disabled={isLoading}
                  size="lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{type === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {type === 'signin' ? 'Sign In' : 'Create Account'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.form>

            <motion.div 
              className="mt-6 text-center text-sm"
              variants={itemVariants}
            >
              {type === 'signin' ? (
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0 h-auto font-semibold holographic magnetic" asChild>
                    <a href="/auth/signup">Sign up</a>
                  </Button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Button variant="link" className="p-0 h-auto font-semibold holographic magnetic" asChild>
                    <a href="/auth/signin">Sign in</a>
                  </Button>
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
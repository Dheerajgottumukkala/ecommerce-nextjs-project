import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, fullName: string) {
  try {
    console.log('Starting signup process for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }

    console.log('Signup successful:', data);

    // Create profile if user was created
    if (data.user && !data.user.email_confirmed_at) {
      console.log('User created, creating profile...');
      
      // Note: We'll create the profile after email confirmation
      // For now, just return the data
      return data;
    }

    // If user already exists and is confirmed, create profile
    if (data.user && data.user.email_confirmed_at) {
      console.log('User confirmed, creating profile...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: data.user.id,
            full_name: fullName.trim(),
            role: 'customer',
          },
        ], {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here, as the user account was created successfully
      }
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Starting signin process for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Supabase signin error:', error);
      throw error;
    }

    console.log('Signin successful:', data);
    return data;
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string }>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}